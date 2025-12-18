import express from 'express';
import { configureCors } from './corsSetup.js';
import morgan from 'morgan';
import { errorMiddleware } from '../middleware/errorMiddleware.js';
import MainRouter from '../routes/mainRouter.js';

export function setupApp(app) {
  configureCors(app); 
  app.use(morgan('dev'));
  app.use(express.json());
  app.set("trust proxy", 1);

  app.use('/api/v1', MainRouter);

  app.get('/', (req, res) => {
    res.json({
      message: 'Agardex Backend API',
      status: 'running',
      version: '1.0.0',
      websocket: 'available',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  app.use(errorMiddleware);
}
