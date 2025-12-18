import { eventBus } from './EventBus.js';
import { PixelCanvas } from './game/PixelCanvas.js';
export class GameEngine {
  constructor() {
    this.pixelCanvas = new PixelCanvas(500, 500);
    this.gameLoop = null;
    this.isRunning = false;
    this.lastUpdateTime = Date.now();

    this.handlePlayerJoin = this.handlePlayerJoin.bind(this);
    this.handlePlayerDisconnect = this.handlePlayerDisconnect.bind(this);
    this.handlePixelPaint = this.handlePixelPaint.bind(this);

    this.setupEventListeners();
  }

  setupEventListeners() {
    eventBus.on('player:join', this.handlePlayerJoin, 10);
    eventBus.on('player:disconnect', this.handlePlayerDisconnect, 10);
    eventBus.on('pixel:paint', this.handlePixelPaint, 10);
    eventBus.on('game:start', () => this.start(), 10);
    eventBus.on('game:stop', () => this.stop(), 10);
  }

  
  handlePlayerJoin(data) {
    const { userId, name, socketId } = data;

    this.pixelCanvas.addUser(userId, name);

    if (socketId) {
      import('../infraestructure/config/socket/SocketManager.js').then(({ socketManager }) => {
        if (socketManager) {
          socketManager.associateSocketWithPlayer(socketId, userId);
        }
      }).catch(err => console.error('Error associating socket with player:', err));
    }

    console.log(`Player ${name} (${userId}) joined PixelCanvas`);

    eventBus.emit('game:playerJoined', {
      userId,
      username: name,
      canvasState: this.pixelCanvas.getCanvasState()
    });

    return { userId, username: name };
  }

  
  handlePixelPaint(data) {
    const { userId, x, y, color } = data;

    const success = this.pixelCanvas.paintPixel(x, y, color, userId);

    if (success) {
      this.pixelCanvas.trackPixelPainted(userId);

      eventBus.emit('pixel:updated', {
        x,
        y,
        color,
        userId,
        timestamp: Date.now()
      });

      console.log(`Pixel painted and broadcasted: (${x}, ${y}) → ${color}`);
    } else {
      console.log(`Failed to paint pixel: (${x}, ${y})`);
    }
  }

  
  handlePlayerDisconnect(data) {
    const { playerId } = data;

    this.pixelCanvas.removeUser(playerId);

    console.log(`Player ${playerId} disconnected from PixelCanvas`);
    eventBus.emit('game:playerLeft', { playerId });
  }
  
  emitGameState() {
    const canvasState = this.pixelCanvas.getCanvasState();
    const stats = this.pixelCanvas.getStats();

    const gameState = {
      canvas: canvasState,
      stats: stats,
      timestamp: Date.now()
    };

    eventBus.emit('game:stateUpdate', gameState);
  }

  
  getStats() {
    return {
      ...this.pixelCanvas.getStats(),
      isRunning: this.isRunning
    };
  }

  start() {
    if (this.isRunning) return;

    console.log('Starting PixelCanvas GameEngine');
    this.isRunning = true;

  
    this.emitGameState();
  }

  stop() {
    if (!this.isRunning) return;

    console.log('Stopping GameEngine');
    this.isRunning = false;

    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  getCanvasStats() {
    return {
      ...this.pixelCanvas.getStats(),
      isRunning: this.isRunning
    };
  }
}