import Player from '../../infraestructure/models/Player.js';
import PlayerService from '../../core/services/PlayerService.js';
import { toPlayerResponse } from '../dto/Profile/ToPlayerResponse.js';
import {UpdatePlayerDto }from '../dto/Profile/UpdatePlayerDto.js';

const playerService = new PlayerService();

export const getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find().sort({ highScore: -1 });
    res.status(200).json({
      success: true,
      count: players.length,
      data: players
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener jugadores',
      error: error.message
    });
  }
};

export const getOne = async (req, res, next) => {
  try {
    const user = await playerService.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(toPlayerResponse(user));
  } catch (error) {
    next(error);
  }
};

export const updateHighScore = async (req, res) => {
  try {
    const { highScore } = req.body;
    
    const player = await Player.findOne({ playerId: req.params.id });
    
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }
    
    if (highScore > player.highScore) {
      player.highScore = highScore;
      player.lastPlayed = Date.now();
      await player.save();
    }
    
    res.status(200).json({
      success: true,
      data: player
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar puntuación',
      error: error.message
    });
  }
};


export const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const leaderboard = await Player.find()
      .sort({ highScore: -1 })
      .limit(limit)
      .select('playerId username highScore');
    
    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tablero de líderes',
      error: error.message
    });
  }
};

export const updatePlayer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dto = UpdatePlayerDto.fromRequest(req.body);

    const updatedPlayer = await playerService.update(id, dto);

    if (!updatedPlayer) {
      return res.status(404).json({ message: 'Jugador no encontrado' });
    }

    return res.status(200).json(toPlayerResponse(updatedPlayer));
  } catch (error) {
    next(error);
  }
};


export const deletePlayer = async (req, res, next) => {
  try {
    const playerId = req.user.id; // ✅ Corregido: usar req.user.id en lugar de req.user.userId

    const deleted = await playerService.delete(playerId);

    if (!deleted) {
      return res.status(404).json({ message: 'Jugador no encontrado' });
    }

    return res.status(200).json({ message: 'Cuenta eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};