import PlayerService from './PlayerService.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../shared/utils/JwtUtils.js';
import AuthResponse from '../../api/dto/Auth/AuthResponse.js';
import AuthLoginRequest from '../../api/dto/Auth/AuthLoginRequest.js';

export default class AuthService {
  constructor() {
    this.playerService = new PlayerService();
  }

  async login(requestBody) {
    try {
      const loginRequest = new AuthLoginRequest(requestBody);
      const { username, password } = loginRequest;

      const player = await this.playerService.findByUsername(username);
      if (!player) {
        return new AuthResponse({
          username: null,
          message: 'Te conocimos, pero no te conocemos',
          jwt: null,
          status: false,
        });
      }

      const isValidPassword = await bcrypt.compare(password, player.password);
      if (!isValidPassword) {
        return new AuthResponse({
          username: null,
          message: 'Incorrect password',
          jwt: null,
          status: false,
        });
      }

      const token = generateToken(player);

      return new AuthResponse({
        username: player.username,
        message: 'Player logged in successfully',
        jwt: token,
        status: true,
      });
    } catch (error) {
      return new AuthResponse({
        username: null,
        message: error.message || 'Login failed',
        jwt: null,
        status: false,
      });
    }
  }

  async register(playerData) {
    try {
      const createdPlayer = await this.playerService.create(playerData);
      const token = generateToken(createdPlayer);

      return new AuthResponse({
        username: createdPlayer.username,
        message: 'Player registered successfully',
        jwt: token,
        status: true,
      });
    } catch (error) {
      return new AuthResponse({
        username: null,
        message: error.message || 'Registration failed',
        jwt: null,
        status: false,
      });
    }
  }
}
