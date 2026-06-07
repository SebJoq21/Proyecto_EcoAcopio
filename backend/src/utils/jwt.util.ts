import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export const generateToken = (payload: object, expiresIn: string = '24h'): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, ENV.JWT_SECRET);
  } catch (error) {
    return null;
  }
};