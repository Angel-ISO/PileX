import { eventBus } from '../../../core/EventBus.js';
import { verifyToken } from '../../../shared/utils/JwtUtils.js';
import { PixelCanvas } from '../../../core/game/PixelCanvas.js';

console.log('Importing PixelCanvas for collaborative drawing...');
export class SocketManager {
  constructor(io) {
    this.io = io;
    this.connectedSockets = new Map();
    this.socketToPlayer = new Map();
    this.spectators = new Set(); 
    
    try {
      this.pixelCanvas = new PixelCanvas(); 
      console.log('SocketManager initialized with PixelCanvas');
      console.log(`PixelCanvas ready: ${this.pixelCanvas.width}x${this.pixelCanvas.height} (${this.pixelCanvas.width * this.pixelCanvas.height} pixels)`);
    } catch (error) {
      console.error('Failed to initialize PixelCanvas:', error);
      throw new Error('PixelCanvas initialization failed');
    }

    this.setupSocketHandlers();
  }

  authenticateSocket(socket) {
    try {
      const token = socket.handshake.auth?.token ||
                   socket.handshake.query?.token ||
                   socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return { authenticated: false, reason: 'No token provided' };
      }

      const payload = verifyToken(token);

      return {
        authenticated: true,
        user: {
          id: payload.sub,
          username: payload.username,
          color: payload.color,
          highScore: payload.highScore
        }
      };
    } catch (error) {
      return { authenticated: false, reason: `Token verification failed: ${error.message}` };
    }
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      const authResult = this.authenticateSocket(socket);
      if (!authResult.authenticated) {
        console.log(`Socket authentication failed: ${authResult.reason}`);
        socket.emit('error', { message: 'Authentication required' });
        socket.disconnect();
        return;
      }

      console.log(`Socket authenticated for user: ${authResult.user.username}`);

      socket.authUser = authResult.user;

      this.connectedSockets.set(socket.id, socket);

      socket.on('joinCanvas', (clientData) => {
        try {
          console.log(`Player join from ${socket.id}:`, clientData);

          const authUser = socket.authUser;
          if (!authUser) {
            socket.emit('error', { message: 'Authentication required' });
            socket.disconnect();
            return;
          }

          const playerData = {
            userId: authUser.id,
            name: authUser.username,
            socketId: socket.id
          };

          console.log('Adding user to PixelCanvas:', playerData);
          console.log(`PixelCanvas status: ${this.pixelCanvas ? 'EXISTS' : 'NULL'}, width: ${this.pixelCanvas?.width}, height: ${this.pixelCanvas?.height}`);

          this.pixelCanvas.addUser(authUser.id, authUser.username);
          console.log(`Added ${authUser.username} to PixelCanvas. Total users: ${this.pixelCanvas.connectedUsers.size}`);

          eventBus.emit('player:join', playerData);

          // Broadcast to other clients that a user joined and update stats
          try {
            this.io.emit('userJoined', { userId: authUser.id, username: authUser.username });
            const stats = this.pixelCanvas.getStats();
            this.io.emit('canvasStats', {
              width: stats.width,
              height: stats.height,
              totalPixels: stats.totalPixels,
              paintedPixels: stats.paintedPixels,
              paintedPercentage: stats.paintedPercentage + '%',
              connectedUsers: stats.connectedUsers
            });
          } catch (err) {
            console.error('Failed to emit userJoined/canvasStats on join:', err);
          }

          socket.emit('canvasWelcome', {
            canvasSize: { width: 500, height: 500 },
            userId: authUser.id,
            username: authUser.username
          });
          console.log(`Sent canvasWelcome to ${authUser.username}`);

          console.log('Preparing to send canvas state...');
          console.log(`PixelCanvas methods available: getCanvasState=${typeof this.pixelCanvas.getCanvasState}, getStats=${typeof this.pixelCanvas.getStats}`);

          const canvasState = this.pixelCanvas.getCanvasState();
          const stats = this.pixelCanvas.getStats();

          console.log(`Canvas state type: ${Array.isArray(canvasState) ? 'ARRAY' : typeof canvasState}, length: ${Array.isArray(canvasState) ? canvasState.length : 'N/A'}`);
          console.log(`First row length: ${Array.isArray(canvasState) && canvasState.length > 0 ? canvasState[0].length : 'N/A'}`);
          console.log(`Stats type: ${typeof stats}, has paintedPixels: ${stats && typeof stats.paintedPixels === 'number'}`);
          console.log(`Sample pixel [0][0]: ${Array.isArray(canvasState) && canvasState.length > 0 && canvasState[0].length > 0 ? canvasState[0][0] : 'N/A'}`);

          console.log(`Canvas stats: ${stats.paintedPixels} painted pixels, ${stats.connectedUsers} users`);

          const fullCanvasState = {
            width: this.pixelCanvas.width,
            height: this.pixelCanvas.height,
            canvas: canvasState,
            stats: {
              paintedPixels: stats.paintedPixels,
              connectedUsers: stats.connectedUsers,
              paintedPercentage: stats.paintedPercentage + '%'
            }
          };

          console.log(`Sending canvasState: ${fullCanvasState.width}x${fullCanvasState.height} with ${fullCanvasState.stats.paintedPixels} pixels`);
          console.log(`Canvas state payload size: ~${JSON.stringify(fullCanvasState).length} bytes`);

          socket.emit('canvasState', fullCanvasState);

          console.log(`Canvas state sent successfully to ${authUser.username}`);
          console.log(`Canvas state emission completed - frontend should now receive the canvas!`);

          const pixelUpdateHandler = (pixelData) => {
            socket.emit('pixelUpdate', pixelData);
          };

          eventBus.on('pixel:updated', pixelUpdateHandler);

          socket.on('disconnect', () => {
            eventBus.off('pixel:updated', pixelUpdateHandler);
          });

        } catch (error) {
          console.error('Error handling canvas join:', error);
          socket.emit('error', { message: 'Failed to join canvas' });
        }
      });

      socket.on('spectate', () => {
        console.log(`Spectator joined: ${socket.id}`);
        this.spectators.add(socket.id);

        socket.emit('welcome', {}, {
          width: 5000,
          height: 5000
        });
      });

      socket.on('paintPixel', (pixelData) => {
        try {
          const authUser = socket.authUser;
          if (!authUser) {
            socket.emit('error', { message: 'Authentication required' });
            return;
          }

          const { x, y, color } = pixelData;

          if (typeof x !== 'number' || typeof y !== 'number' || typeof color !== 'string') {
            socket.emit('error', { message: 'Invalid pixel data' });
            return;
          }

          const success = this.pixelCanvas.paintPixel(x, y, color, authUser.id);

          if (success) {
            this.pixelCanvas.trackPixelPainted(authUser.id);

            this.io.emit('pixelUpdate', {
              x,
              y,
              color,
              userId: authUser.id,
              timestamp: Date.now()
            });

            try {
              const stats = this.pixelCanvas.getStats();
              this.io.emit('canvasStats', {
                width: stats.width,
                height: stats.height,
                totalPixels: stats.totalPixels,
                paintedPixels: stats.paintedPixels,
                paintedPercentage: stats.paintedPercentage + '%',
                connectedUsers: stats.connectedUsers
              });
            } catch (err) {
              console.error('Failed to emit canvasStats after paintPixel:', err);
            }

            console.log(`Pixel painted: (${x}, ${y}) ${color} by ${authUser.username}`);
          } else {
            socket.emit('error', { message: 'Failed to paint pixel' });
          }
        } catch (error) {
          console.error('Error painting pixel:', error);
          socket.emit('error', { message: 'Internal server error' });
        }
      });

      socket.on('ping', () => {
        socket.emit('pong');
      });

      socket.on('getCanvasStats', () => {
        try {
          const stats = this.pixelCanvas.getStats();
          socket.emit('canvasStats', {
            width: stats.width,
            height: stats.height,
            totalPixels: stats.totalPixels,
            paintedPixels: stats.paintedPixels,
            paintedPercentage: stats.paintedPercentage + '%',
            connectedUsers: stats.connectedUsers
          });
          console.log(`Sent canvas stats to ${socket.authUser?.username}`);
        } catch (error) {
          console.error('Error getting canvas stats:', error);
          socket.emit('error', { message: 'Failed to get stats' });
        }
      });

      socket.on('getCanvasState', () => {
        try {
          const canvasState = this.pixelCanvas.getCanvasState();
          const stats = this.pixelCanvas.getStats();

          const fullCanvasState = {
            width: this.pixelCanvas.width,
            height: this.pixelCanvas.height,
            canvas: canvasState,
            stats: {
              paintedPixels: stats.paintedPixels,
              connectedUsers: stats.connectedUsers,
              paintedPercentage: stats.paintedPercentage + '%'
            }
          };

          socket.emit('canvasState', fullCanvasState);
          console.log(`Sent canvas state to ${socket.authUser?.username}: ${this.pixelCanvas.width}x${this.pixelCanvas.height}`);
        } catch (error) {
          console.error('Error getting canvas state:', error);
          socket.emit('error', { message: 'Failed to get canvas state' });
        }
      });

      socket.on('paintPixelBatch', (batchData) => {
        try {
          const authUser = socket.authUser;
          if (!authUser) {
            socket.emit('error', { message: 'Authentication required' });
            return;
          }

          const { pixels } = batchData;
          if (!Array.isArray(pixels)) {
            socket.emit('error', { message: 'Invalid batch data' });
            return;
          }

          let paintedCount = 0;
          const pixelUpdates = [];

          for (const pixel of pixels) {
            const { x, y, color } = pixel;

            if (this.pixelCanvas.paintPixel(x, y, color, authUser.id)) {
              paintedCount++;
              pixelUpdates.push({
                x, y, color,
                userId: authUser.id,
                timestamp: Date.now()
              });
            }
          }

          if (paintedCount > 0) {
            for (let i = 0; i < paintedCount; i++) {
              this.pixelCanvas.trackPixelPainted(authUser.id);
            }

            this.io.emit('pixelUpdateBatch', pixelUpdates);

            try {
              const stats = this.pixelCanvas.getStats();
              this.io.emit('canvasStats', {
                width: stats.width,
                height: stats.height,
                totalPixels: stats.totalPixels,
                paintedPixels: stats.paintedPixels,
                paintedPercentage: stats.paintedPercentage + '%',
                connectedUsers: stats.connectedUsers
              });
            } catch (err) {
              console.error('Failed to emit canvasStats after paintPixelBatch:', err);
            }

            console.log(`Batch painted: ${paintedCount}/${pixels.length} pixels by ${authUser.username}`);
          }

          socket.emit('batchPaintResult', {
            requested: pixels.length,
            painted: paintedCount,
            success: paintedCount > 0
          });

        } catch (error) {
          console.error('Error painting pixel batch:', error);
          socket.emit('error', { message: 'Failed to paint pixel batch' });
        }
      });

      socket.on('respawn', () => {
        const playerId = this.getPlayerIdForSocket(socket.id);
        if (playerId) {
          eventBus.emit('player:respawn', { playerId });
        }
      });

      socket.on('playerChat', (data) => {
        const playerId = this.getPlayerIdForSocket(socket.id);
        if (playerId) {
          const sanitizedMessage = (data.message || '').replace(/(<([^>]+)>)/ig, '').substring(0, 35);
          console.log(`${playerId}: ${sanitizedMessage}`);

          this.io.emit('serverSendPlayerChat', {
            sender: playerId, 
            message: sanitizedMessage
          });
        }
      });

      socket.on('disconnect', () => {
        const authUser = socket.authUser;
        const playerId = this.getPlayerIdForSocket(socket.id);

        if (authUser) {
          this.pixelCanvas.removeUser(authUser.id);
          console.log(`User ${authUser.username} (${authUser.id}) disconnected from PixelCanvas`);
        }

        if (playerId) {
          console.log( `Player ${playerId} disconnected`);
          eventBus.emit('player:disconnect', { playerId });
          try {
            this.io.emit('userLeft', { userId: playerId });
          } catch (err) {
            console.error('Failed to emit userLeft:', err);
          }
          try {
            const stats = this.pixelCanvas.getStats();
            this.io.emit('canvasStats', {
              width: stats.width,
              height: stats.height,
              totalPixels: stats.totalPixels,
              paintedPixels: stats.paintedPixels,
              paintedPercentage: stats.paintedPercentage + '%',
              connectedUsers: stats.connectedUsers
            });
          } catch (err) {
            console.error('Failed to emit canvasStats after disconnect:', err);
          }
        } else if (this.spectators.has(socket.id)) {
          console.log(`Spectator ${socket.id} disconnected`);
          this.spectators.delete(socket.id);
        }

        this.removeSocketAssociation(socket.id);
        this.connectedSockets.delete(socket.id);
      });

      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  getPlayerIdForSocket(socketId) {
    return this.socketToPlayer.get(socketId) || null;
  }

  
  associateSocketWithPlayer(socketId, playerId) {
    this.socketToPlayer.set(socketId, playerId);
    console.log(`Associated socket ${socketId} with player ${playerId}`);
  }

  
  removeSocketAssociation(socketId) {
    const playerId = this.socketToPlayer.get(socketId);
    if (playerId) {
      this.socketToPlayer.delete(socketId);
      console.log(`Removed association for socket ${socketId} (player ${playerId})`);
    }
  }

 
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  
  sendTo(socketId, event, data) {
    const socket = this.connectedSockets.get(socketId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  getStats() {
    return {
      connectedSockets: this.connectedSockets.size,
      players: this.socketToPlayer.size,
      spectators: this.spectators.size,
      io: this.io ? 'initialized' : 'not initialized'
    };
  }
}