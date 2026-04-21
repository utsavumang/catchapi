import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RefreshToken } from '../models/refreshToken.model';
import { env } from '../config/env';

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_EXPIRES_IN_JWT = '7d';

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

export const generateRefreshToken = async (userId: string): Promise<string> => {
  const rawToken = crypto.randomBytes(64).toString('hex');

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS);

  await RefreshToken.create({
    tokenHash,
    userId,
    expiresAt,
  });

  return jwt.sign({ token: rawToken }, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN_JWT,
  });
};

export const hashToken = (rawToken: string): string => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};
