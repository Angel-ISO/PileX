import 'dotenv/config';
import http from 'http';
import app from './api/app.js';
import { Server } from 'socket.io';
import './infraestructure/config/db/DbConect.js';
import { GameServer } from './infraestructure/config/socket/GameServer.js';

const host = process.env.HOST;
const port = parseInt(process.env.PORT);

const server = http.createServer(app);

const io = new Server(server, {
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

global.io = io;

const gameServer = new GameServer(io);
gameServer.initialize();

console.log(' GameServer initialized successfully with PixelCanvas support');

process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  gameServer.shutdown();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n Received SIGTERM, shutting down gracefully...');
  gameServer.shutdown();
  server.close(() => {
    console.log(' Server closed');
    process.exit(0);
  });
});

server.listen(port, host, () => {
  console.log(`Server running at: http://${host}:${port}`);
  console.log(` Socket.IO server initialized on port ${port}`);
});
