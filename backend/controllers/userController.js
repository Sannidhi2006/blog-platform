import User from '../models/User.js';
import Post from '../models/Post.js';

// ────────────────────────────────────────────
// GET /api/users/:id
// ────────────────────────────────────────────
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', user });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
    }
    next(err);
  }
};

// ────────────────────────────────────────────
// GET /api/users/:id/posts
// ────────────────────────────────────────────
export const getUserPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .populate('author', 'name username');

    res.status(200).json({
      status: 'success',
      count: posts.length,
      user: { _id: user._id, name: user.name, username: user.username },
      posts,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'error', message: 'Invalid user ID' });
    }
    next(err);
  }
};
