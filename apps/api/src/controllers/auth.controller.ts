import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '../utils/generateToken';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth.middleware';
import { env } from '../config/env';

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'strict' : 'lax') as
    | 'strict'
    | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/',
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError('User already exists', 400);
  }

  const user = await User.create({ name, email, password });
  const userId = user._id.toString();

  const accessToken = generateAccessToken(userId);
  const refreshToken = await generateRefreshToken(userId);

  res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: accessToken,
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // @ts-expect-error - matchPassword is a custom schema method not recognized by default Mongoose types
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const userId = user._id.toString();

  const accessToken = generateAccessToken(userId);
  const refreshToken = await generateRefreshToken(userId);

  res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: accessToken,
  });
});

// @desc    Refresh access token using refresh token cookie
// @route   POST /api/v1/auth/refresh
export const refreshAccessToken = catchAsync(
  async (req: Request, res: Response) => {
    const incomingToken = req.cookies.refreshToken;

    if (!incomingToken) {
      throw new AppError('No refresh token provided', 401);
    }

    let decoded: { token: string };
    try {
      decoded = jwt.verify(incomingToken, env.JWT_REFRESH_SECRET) as {
        token: string;
      };
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const tokenHash = hashToken(decoded.token);
    const storedToken = await RefreshToken.findOne({ tokenHash });

    if (!storedToken) {
      res.clearCookie('refreshToken', { path: '/' });
      throw new AppError('Refresh token invalid or already used', 401);
    }

    const user = await User.findById(storedToken.userId);
    if (!user) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      throw new AppError('User no longer exists', 401);
    }

    await RefreshToken.deleteOne({ _id: storedToken._id });

    const userId = user._id.toString();
    const newAccessToken = generateAccessToken(userId);
    const newRefreshToken = await generateRefreshToken(userId);

    res.cookie('refreshToken', newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    res.status(200).json({
      token: newAccessToken,
    });
  }
);

// @desc    Logout — invalidate refresh token
// @route   POST /api/v1/auth/logout
export const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const incomingToken = req.cookies.refreshToken;

  if (incomingToken) {
    try {
      const decoded = jwt.verify(incomingToken, env.JWT_REFRESH_SECRET) as {
        token: string;
      };
      const tokenHash = hashToken(decoded.token);
      await RefreshToken.deleteOne({ tokenHash });
    } catch {
      // Token already invalid — still proceed with logout
    }
  }

  res.clearCookie('refreshToken', { path: '/' });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
});
