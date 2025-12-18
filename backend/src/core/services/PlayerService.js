import PlayerRepository from '../../infraestructure/Repository/PlayerRepository.js';
import bcrypt from 'bcryptjs';
import { createPager } from '../helpers/Pager.js';
import { createParams } from '../helpers/Params.js';

export default class PlayerService {
  constructor({ playerRepository = new PlayerRepository() } = {}) {
    this.playerRepository = playerRepository;
  }

  async findById(id) {
    return this.playerRepository.findById(id);
  }

  async findByUsername(username) {
    return this.playerRepository.findByUsername(username);
  }

  async create(playerData) {
    const usernameNormalized = normalizeUsername(playerData.username);
    
    const existingUser = await this.playerRepository.findByUsername(usernameNormalized);
    if (existingUser) {
      throw new Error(`El username "${playerData.username}" ya está en uso`);
    }
    
    try {
      return await this.playerRepository.create({
        ...playerData,
        username: usernameNormalized
      });
    } catch (err) {
      if (err.code === 11000) {
        throw new Error('Ya existe un jugador con ese username');
      }
      throw err;
    }
  }


  async update(id, updatePlayerDto) {
  if (updatePlayerDto.username !== undefined) {
    const existing = await this.playerRepository.findByUsername(updatePlayerDto.username);
    if (existing && existing._id.toString() !== id) {
      throw new Error(`El username "${updatePlayerDto.username}" ya está en uso`);
    }
  }

  if (updatePlayerDto.password !== undefined) {
    const salt = await bcrypt.genSalt(10);
    updatePlayerDto.password = await bcrypt.hash(updatePlayerDto.password, salt);
  }

  const updates = {};
  if (updatePlayerDto.username !== undefined) updates.username = updatePlayerDto.username;
  if (updatePlayerDto.password !== undefined) updates.password = updatePlayerDto.password;
  if (updatePlayerDto.bornDate !== undefined) updates.bornDate = updatePlayerDto.bornDate;

  try {
    return await this.playerRepository.update(id, updates);
  } catch (err) {
    if (err.code === 11000) {
      throw new Error('No puedes usar el mismo username que otro jugador');
    }
    throw err;
  }
}


  async delete(id) {
    return this.playerRepository.delete(id);
  }

  async findAll({ pageIndex = 1, pageSize = 10, search = '' } = {}) {
    const params = createParams({ pageIndex, pageSize, search });

    const query = !params.search
      ? {}
      : {
          $or: [
            { username: { $regex: params.search, $options: 'i' } },
            { color: { $regex: params.search, $options: 'i' } },
          ],
        };

    const [total, players] = await Promise.all([
      this.playerRepository.countDocuments(query),
      this.playerRepository.findAll({
        query,
        skip: (params.pageIndex - 1) * params.pageSize,
        limit: params.pageSize,
      }),
    ]);

    return createPager({
      registers: players,
      total,
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      search: params.search,
    });
  }
}

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}
