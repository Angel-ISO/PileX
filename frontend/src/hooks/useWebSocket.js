import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

let globalSocket = null;
let isConnecting = false;

class PixelRateLimiter {
  constructor(maxPixelsPerSecond = 100, maxBatchSize = 50) {
    this.maxPixelsPerSecond = maxPixelsPerSecond;
    this.maxBatchSize = maxBatchSize;
    this.pixelsSent = [];
    this.pixelQueue = [];
    this.isProcessing = false;
  }

  canSendPixels(count) {
    const now = Date.now();
    this.pixelsSent = this.pixelsSent.filter(time => now - time < 1000);
    return this.pixelsSent.length + count <= this.maxPixelsPerSecond;
  }

  queuePixels(pixels) {
    this.pixelQueue.push(...pixels);
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing || this.pixelQueue.length === 0) return;

    this.isProcessing = true;
    let currentBatch = null;

    try {
      currentBatch = this.pixelQueue.splice(0, this.maxBatchSize);

      if (globalSocket && globalSocket.connected && currentBatch.length > 0) {
        await new Promise((resolve, reject) => {
          globalSocket.emit('paintPixelBatch', {
            pixels: currentBatch,
            timestamp: Date.now()
          }, (response) => {
            if (response?.success !== false) {
              resolve();
            } else {
              reject(new Error(response?.error || 'Batch send failed'));
            }
          });

          setTimeout(() => reject(new Error('Batch send timeout')), 5000);
        });

        this.pixelsSent.push(...new Array(currentBatch.length).fill(Date.now()));
      }
    } catch (error) {
      console.error('Error sending pixel batch:', error);
      if (currentBatch && currentBatch.length > 0) {
        this.pixelQueue.unshift(...currentBatch);
      }
    } finally {
      this.isProcessing = false;
      if (this.pixelQueue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }
}

const globalRateLimiter = new PixelRateLimiter();

export const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [canvasState, setCanvasState] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const socketRef = useRef(null);
  const remotePixelHandlers = useRef(new Set());

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const connect = useCallback(() => {
    if (!url || isConnecting) return;

    console.log('Attempting to connect to Socket.IO server...');

    if (globalSocket && globalSocket.connected) {
      console.log('Reusing existing Socket.IO connection');
      setSocket(globalSocket);
      setConnectionStatus('Connected');
      setError(null);
      return;
    }

    if (isConnecting) {
      console.log('Connection already in progress...');
      return;
    }

    isConnecting = true;

    try {
      console.log(`Connecting to: ${url}`);

      const token = getAuthToken();

      const newSocket = io(url, {
        transports: ['websocket'],
        timeout: 5000,
        forceNew: false,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        auth: {
          token: token
        }
      });

      globalSocket = newSocket;
      socketRef.current = newSocket;

      newSocket.on('connect', () => {
        console.log('Socket.IO connected successfully!');
        setConnectionStatus('Connected');
        setError(null);
        isConnecting = false;
        setSocket(newSocket);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
        setConnectionStatus('Disconnected');
        setSocket(null);
        isConnecting = false;

        if (globalSocket === newSocket) {
          globalSocket = null;
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error.message);
        setError(`Connection failed: ${error.message}`);
        setConnectionStatus('Error');
        isConnecting = false;
      });

      newSocket.on('reconnect', () => {
        console.log('Socket.IO reconnected');
        setConnectionStatus('Connected');
        setError(null);
        isConnecting = false;
      });

      newSocket.on('reconnect_failed', () => {
        console.log('Socket.IO reconnection failed');
        setConnectionStatus('Connection Failed');
        setError('Failed to reconnect');
        isConnecting = false;
      });

      newSocket.on('canvasWelcome', (data) => {
        setLastMessage({ type: 'canvasWelcome', data });
        setUserStats({ userId: data.userId, username: data.username });
      });

      newSocket.on('canvasState', (data) => {
        console.log(' Canvas state received:', {
          width: data.width,
          height: data.height,
          hasCanvas: !!data.canvas,
          canvasLength: data.canvas?.length,
          stats: data.stats,
          payloadSize: JSON.stringify(data).length
        });

        if (!data.canvas || !Array.isArray(data.canvas) || data.canvas.length === 0) {
          console.error('Invalid canvas data received:', data);
          return;
        }

        setCanvasState(data);
        setLastMessage({ type: 'canvasState', data });
        console.log('Canvas state set successfully');
      });

      newSocket.on('pixelUpdate', (data) => {
        setLastMessage({ type: 'pixelUpdate', data });
        setCanvasState(prevState => {
          if (!prevState) return prevState;
          const newCanvas = [...prevState.canvas];
          if (newCanvas[data.y] && newCanvas[data.y][data.x] !== undefined) {
            newCanvas[data.y][data.x] = data.color;
          }
          return { ...prevState, canvas: newCanvas };
        });
        try {
          for (const h of remotePixelHandlers.current) {
            try { h([data]); } catch (e) { console.error('remotePixelHandler error', e); }
          }
        } catch (err) {
          console.error('Error dispatching remote pixel handlers:', err);
        }
      });

      newSocket.on('userJoined', (data) => {
        console.log('User joined:', data.username);
        setConnectedUsers(prev => {
          const without = prev.filter(u => u.id !== data.userId);
          return [...without, {
            id: data.userId,
            username: data.username,
            connectedAt: Date.now()
          }];
        });
        if (newSocket.connected) newSocket.emit('getCanvasStats');
        setLastMessage({ type: 'userJoined', data });
      });

      newSocket.on('userLeft', (data) => {
        console.log(' User left:', data.userId);
        setConnectedUsers(prev => prev.filter(u => u.id !== data.userId));
        if (newSocket.connected) newSocket.emit('getCanvasStats');
        setLastMessage({ type: 'userLeft', data });
      });

      newSocket.on('canvasStats', (data) => {
        console.log('📊 Canvas stats:', data);
        setLastMessage({ type: 'canvasStats', data });
        setCanvasState(prev => {
          if (!prev) return prev;
          const newStats = {
            paintedPixels: data.paintedPixels,
            connectedUsers: data.connectedUsers,
            paintedPercentage: data.paintedPercentage
          };
          return { ...prev, stats: newStats };
        });
        setConnectedUsers(prev => {
          if (prev.length === data.connectedUsers) return prev;
          return prev;
        });
      });

      newSocket.on('pixelUpdateBatch', (updates) => {
        setLastMessage({ type: 'pixelUpdateBatch', data: updates });
        setCanvasState(prevState => {
          if (!prevState) return prevState;
          const newCanvas = prevState.canvas ? prevState.canvas.map(row => [...row]) : prevState.canvas;
          for (const u of updates) {
            if (newCanvas && newCanvas[u.y] && newCanvas[u.y][u.x] !== undefined) {
              newCanvas[u.y][u.x] = u.color;
            }
          }
          return { ...prevState, canvas: newCanvas };
        });
        try {
          for (const h of remotePixelHandlers.current) {
            try { h(updates); } catch (e) { console.error('remotePixelHandler error', e); }
          }
        } catch (err) {
          console.error('Error dispatching remote pixel handlers:', err);
        }
        if (newSocket.connected) newSocket.emit('getCanvasStats');
      });

      newSocket.on('pong', () => {
        setLastMessage({ type: 'pong', data: { timestamp: Date.now() } });
      });

      newSocket.on('error', (error) => {
        console.error('❌ Socket error:', error);
        setError(error.message || 'Connection error');
        setLastMessage({ type: 'error', data: error });
      });

    } catch (err) {
      console.error('❌ Failed to create Socket.IO connection:', err);
      setError('Failed to create connection');
      setConnectionStatus('Error');
      isConnecting = false;
    }
  }, [url]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting Socket.IO...');

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
    }

    setSocket(null);
    setConnectionStatus('Disconnected');
    isConnecting = false;
  }, []);

  const sendMessage = useCallback((type, data = null) => {
    const activeSocket = socket || globalSocket;

    if (activeSocket && activeSocket.connected) {
      console.log(`📤 Sending ${type}:`, data);
      activeSocket.emit(type, data);
      return true;
    }

    console.log('⚠️ Cannot send message: socket not connected');
    return false;
  }, [socket]);


  useEffect(() => {
    if (url && !socket) {
      connect();
    }

  
    return () => {
      console.log('🧹 useWebSocket cleanup - preserving connection');
    };
  }, [url, connect]);

  const joinCanvas = useCallback(() => {
    console.log('🎨 useWebSocket.joinCanvas called');

    const activeSocket = socket || globalSocket;
    if (!activeSocket || !activeSocket.connected) {
      console.error('❌ Cannot join canvas: socket not connected');
      return false;
    }

    const result = sendMessage('joinCanvas', {});
    console.log('🎨 useWebSocket.joinCanvas result:', result);
    return result;
  }, [sendMessage, socket]);

  const paintPixel = useCallback((x, y, color) => {
    if (!globalRateLimiter.canSendPixels(1)) {
      globalRateLimiter.queuePixels([{ x, y, color }]);
      return true; 
    }

    return sendMessage('paintPixel', { x, y, color });
  }, [sendMessage]);

  const paintPixelsBatch = useCallback((pixels) => {
    if (!Array.isArray(pixels) || pixels.length === 0) return false;

    if (!globalRateLimiter.canSendPixels(pixels.length)) {
      globalRateLimiter.queuePixels(pixels);
      return true; 
    }

    return sendMessage('paintPixelBatch', { pixels, timestamp: Date.now() });
  }, [sendMessage]);

  const getCanvasStats = useCallback(() => {
    return sendMessage('getCanvasStats');
  }, [sendMessage]);

  const ping = useCallback(() => {
    return sendMessage('ping');
  }, [sendMessage]);

  const spectate = useCallback(() => {
    return sendMessage('spectate');
  }, [sendMessage]);

  const respawn = useCallback(() => {
    return sendMessage('respawn');
  }, [sendMessage]);

  return {
    socket,
    connectionStatus,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
    isConnected: connectionStatus === 'Connected',

    canvasState,
    connectedUsers,
    userStats,

    joinCanvas,
    paintPixel,
    paintPixelsBatch,
    getCanvasStats,
    ping,
    spectate,
    respawn,

    // register handlers that receive arrays of pixel updates [{x,y,color}]
    registerRemotePixelHandler: (handler) => { remotePixelHandlers.current.add(handler); return () => remotePixelHandlers.current.delete(handler); },
    unregisterRemotePixelHandler: (handler) => { remotePixelHandlers.current.delete(handler); },

    rateLimiterStatus: {
      queueLength: globalRateLimiter.pixelQueue.length,
      pixelsPerSecond: globalRateLimiter.pixelsSent.length,
      isProcessing: globalRateLimiter.isProcessing
    }
  };
};