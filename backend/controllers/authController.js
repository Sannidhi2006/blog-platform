import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate a signed JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ────────────────────────────────────────────
// POST /api/auth/register
// ────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, username, email, password, confirmPassword } = req.body;

    // Field presence validation
    if (!name || !username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required: name, username, email, password, confirmPassword',
      });
    }

    // Password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Passwords do not match',
      });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(409).json({
        status: 'error',
        message: 'An account with this email already exists',
      });
    }

    // Check duplicate username
    const existingUsername = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUsername) {
      return res.status(409).json({
        status: 'error',
        message: 'This username is already taken',
      });
    }

    // Create user (password hashed by pre-save hook)
    const user = await User.create({ name, username, email, password });

    const token = signToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      token,
      user,   // toJSON() strips the password automatically
    });
  } catch (err) {
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ status: 'error', message: messages.join('. ') });
    }
    next(err);
  }
};

// ────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const identifier = req.body.identifier || req.body.email || req.body.username;
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email/username and password',
      });
    }

    // Find by email or username; explicitly select password
    const isEmail = identifier.includes('@');
    const query = isEmail
      ? { email: identifier.toLowerCase().trim() }
      : { username: identifier.toLowerCase().trim() };

    const user = await User.findOne(query).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      token,
      user,   // toJSON() strips the password
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// GET /api/auth/me  (protected)
// ────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    // req.user already attached by protect middleware (no password selected)
    res.status(200).json({
      status: 'success',
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};
