import { verifyToken } from '../../shared/utils/JwtUtils.js';  
import ApiResponse from '../../shared/errors/ApiResponse.js';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
      return res.status(401).json(new ApiResponse(401, 'Authorization header missing'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json(new ApiResponse(401));
    }

    const payload = verifyToken(token);

    req.user = {
      id: payload.sub,
      username: payload.username,
      color: payload.color,
      highScore: payload.highScore,
    };

    next();
  } catch (error) {
    console.error('JWT error:', error.message);
    return res.status(403).json(new ApiResponse(403, 'Invalid or expired token'));
  }
};
