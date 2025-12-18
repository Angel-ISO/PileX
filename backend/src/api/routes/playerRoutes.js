import express from 'express';
import {
  getAllPlayers,
  getOne,
  updateHighScore,
  getLeaderboard,
  updatePlayer,
  deletePlayer
} from '../controllers/playerController.js';
import { authenticateToken } from '../../api/middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getAllPlayers);
router.get('/leaderboard', authenticateToken, getLeaderboard);
router.get('/:id',authenticateToken, getOne);
router.put('/:id/score', authenticateToken, updateHighScore);


router.patch('/profile/:id', authenticateToken, updatePlayer);
router.delete('/profile/:id', authenticateToken, deletePlayer);

export default router;