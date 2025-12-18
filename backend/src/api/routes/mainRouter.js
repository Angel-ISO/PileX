import express from 'express';
import playerRoutes from './playerRoutes.js';
import authRoutes from './authRoutes.js';

const router = express.Router();

router.use('/players', playerRoutes);
router.use('/auth', authRoutes);

router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

export default router;
