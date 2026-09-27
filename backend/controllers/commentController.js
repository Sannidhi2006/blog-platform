import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// ────────────────────────────────────────────
// GET /api/comments/:postId
// ────────────────────────────────────────────
export const getComments = async (req, res, next) => {
  try {
    const postExists = await Post.exists({ _id: req.params.postId });
    if (!postExists) {
      return res.status(404).json({ status: 'error', message: 'Post not found' });
    }

    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: -1 })
      .populate('author', 'name username');

    res.status(200).json({ status: 'success', count: comments.length, comments });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'error', message: 'Invalid post ID' });
    }
    next(err);
  }
};

// ────────────────────────────────────────────
// POST /api/comments/:postId  (protected)
// ────────────────────────────────────────────
export const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ status: 'error', message: 'Comment content is required' });
    }

    const postExists = await Post.exists({ _id: req.params.postId });
    if (!postExists) {
      return res.status(404).json({ status: 'error', message: 'Post not found' });
    }

    const comment = await Comment.create({
      content: content.trim(),
      author: req.user._id || req.user.id,
      post: req.params.postId,
    });

    await comment.populate('author', 'name username');

    // Update commentCount on Post
    await Post.findByIdAndUpdate(req.params.postId, { $inc: { commentCount: 1 } });

    res.status(201).json({ status: 'success', message: 'Comment added', comment });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ status: 'error', message: messages.join('. ') });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'error', message: 'Invalid post ID' });
    }
    next(err);
  }
};

// ────────────────────────────────────────────
// PUT /api/comments/:commentId  (protected, author only)
// ────────────────────────────────────────────
export const updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ status: 'error', message: 'Comment content is required' });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ status: 'error', message: 'Comment not found' });
    }

    // Author check
    const userId = (req.user._id || req.user.id).toString();
    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to edit this comment',
      });
    }

    comment.content = content.trim();
    await comment.save();
    await comment.populate('author', 'name username');

    res.status(200).json({
      status: 'success',
      message: 'Comment updated successfully',
      comment,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'error', message: 'Invalid comment ID' });
    }
    next(err);
  }
};

// ────────────────────────────────────────────
// DELETE /api/comments/:commentId  (protected, author only)
// ────────────────────────────────────────────
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ status: 'error', message: 'Comment not found' });
    }

    // Author check
    const userId = (req.user._id || req.user.id).toString();
    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to delete this comment',
      });
    }

    const postId = comment.post;
    await comment.deleteOne();

    // Decrement commentCount on Post
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: -1 } });

    res.status(200).json({ status: 'success', message: 'Comment deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'error', message: 'Invalid comment ID' });
    }
    next(err);
  }
};
