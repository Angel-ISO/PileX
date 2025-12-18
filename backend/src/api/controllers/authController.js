import AuthService from '../../core/services/AuthService.js';

const authService = new AuthService();

export const register = async (req, res, next) => {
  try {
    const response = await authService.register(req.body);
    res.status(response.status ? 201 : 400).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const response = await authService.login(req.body);
    res.status(response.status ? 200 : 401).json(response);
  } catch (error) {
    next(error);
  }
};
