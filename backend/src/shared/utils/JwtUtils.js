import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const ISSUER = process.env.JWT_ISSUER;
const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const generateToken = (player) => {
  const payload = {
    sub: player._id.toString(),
    username: player.username,
    jti: uuidv4(),
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
  };

  const options = {
    issuer: ISSUER,
    expiresIn: EXPIRES_IN,
  };

  return jwt.sign(payload, SECRET, options);
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET, {
      issuer: ISSUER,
    });
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};
