import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { generateToken } from '../utils/generateToken';
import { registerSchema, loginSchema } from '@catchapi/shared';

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ errors: validation.error.errors });
      return;
    }

    const { name, email, password } = validation.data;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id as string),
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    } else {
      res
        .status(500)
        .json({ message: 'Server error', error: 'Unknown error occurred' });
    }
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ errors: validation.error.errors });
      return;
    }

    const { email, password } = validation.data;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id as string),
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    } else {
      res
        .status(500)
        .json({ message: 'Server error', error: 'Unknown error occurred' });
    }
  }
};
