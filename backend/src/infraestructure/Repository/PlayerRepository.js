import Player from '../models/Player.js';
export default class PlayerRepository {

  async exists(username) {
    const result = await Player.exists({ username: username });
    return result;
  }
  

  async findByUsername(username) {
    return Player.findOne({ username });
  }

  async findById(id) {
    return Player.findById(id);
  }

  async create(userData) {
    return Player.create(userData);
  }

  async update(id, updateData) {
    return Player.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return Player.findByIdAndDelete(id);
  }

  async countDocuments(query = {}) {
    return Player.countDocuments(query);
  }

  async findAll({ query = {}, skip = 0, limit = 10, sort = {} }) {
    return Player.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort);
  }
}
