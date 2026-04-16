import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { generateToken } from '../utils/generateToken';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = validation.data;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError('User already exists', 400);
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id.toString()),
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = validation.data;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
  // @ts-expect-error - matchPassword is a custom schema method not recognized by default Mongoose types
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id.toString()),
  });
});
