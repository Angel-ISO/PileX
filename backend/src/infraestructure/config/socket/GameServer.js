import { GameEngine } from '../../../core/GameEngine.js';
import { SocketManager } from './SocketManager.js';
import { eventBus } from '../../../core/EventBus.js';


export class GameServer {
  constructor(io) {
    this.io = io;
    this.gameEngine = null;
    this.socketManager = null;
    this.isInitialized = false;

  }

  initialize() {
    if (this.isInitialized) return;

    try {
      this.gameEngine = new GameEngine();

      this.socketManager = new SocketManager(this.io);

      this.setupEventListeners();

      this.isInitialized = true;

      this.startGame();

    } catch (error) {
      console.error('Failed to initialize GameServer:', error);
      throw error;
    }
  }

  setupEventListeners() {
    eventBus.on('game:playerJoined', (data) => {
      console.log(`Broadcasting user joined: ${data.username}`);
      this.socketManager.broadcast('userJoined', {
        userId: data.userId,
        username: data.username
      });
    });

    eventBus.on('game:playerLeft', (data) => {
      console.log(`Broadcasting user left: ${data.playerId}`);
      this.socketManager.broadcast('userLeft', { userId: data.playerId });
    });

    eventBus.on('pixel:updated', (pixelData) => {
      console.log(`Broadcasting pixel update: (${pixelData.x}, ${pixelData.y}) → ${pixelData.color}`);
      this.socketManager.broadcast('pixelUpdate', pixelData);
    });

    eventBus.on('game:stateUpdate', (gameState) => {
    
      if (gameState.stats && gameState.stats.connectedUsers > 0) {
        console.log(`Canvas state: ${gameState.stats.connectedUsers} users, ${gameState.stats.paintedPixels} pixels painted`);
      }
    });

    eventBus.on('game:statsRequest', (data) => {
      const stats = this.gameEngine.getStats();
      this.socketManager.sendTo(data.socketId, 'canvasStats', stats);
    });
  }

  
  startGame() {
    if (!this.gameEngine) {
      throw new Error('GameEngine not initialized');
    }

    console.log('Starting game...');
    eventBus.emit('game:start');
  }

 
  stopGame() {
    if (!this.gameEngine) return;

    console.log('Stopping game...');
    eventBus.emit('game:stop');
  }

 
  getStats() {
    return {
      initialized: this.isInitialized,
      gameEngine: this.gameEngine ? this.gameEngine.getStats() : null,
      socketManager: this.socketManager ? this.socketManager.getStats() : null,
      eventBus: {
        listeners: eventBus.eventNames().length,
        events: eventBus.eventNames()
      }
    };
  }


  shutdown() {
    console.log('Shutting down GameServer...');

    if (this.gameEngine) {
      this.gameEngine.stop();
    }

    eventBus.removeAllListeners();

    console.log('GameServer shutdown complete');
  }
}