import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: delete image file from disk
const deleteImageFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, '..', 'uploads', filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('[Upload] Failed to delete image:', err.message);
    }
  });
};

// Helper: attach actual comment counts to post list
const attachCommentCounts = async (posts) => {
  if (!posts || posts.length === 0) return [];
  const postIds = posts.map((p) => p._id);
  const commentCounts = await Comment.aggregate([
    { $match: { post: { $in: postIds } } },
    { $group: { _id: '$post', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  commentCounts.forEach((c) => {
    countMap[c._id.toString()] = c.count;
  });

  return posts.map((post) => {
    const obj = post.toObject ? post.toObject() : { ...post };
    obj.commentCount = countMap[post._id.toString()] ?? obj.commentCount ?? 0;
    obj.likesCount = Array.isArray(obj.likes) ? obj.likes.length : 0;
    return obj;
  });
};

// ────────────────────────────────────────────
// GET /api/posts  — list, newest first, supports ?page=&limit=&category=
// ────────────────────────────────────────────
export const getPosts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 9 } = req.query;
    const filter = {};

    if (category && category.trim() && category.trim() !== 'All') {
      filter.category = category.trim();
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    const totalPosts = await Post.countDocuments(filter);
    const rawPosts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('author', 'name username');

    const posts = await attachCommentCounts(rawPosts);

    res.status(200).json({
      status: 'success',
      count: posts.length,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limitNum) || 1,
      currentPage: pageNum,
      hasMore: skip + posts.length < totalPosts,
      posts,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// GET /api/posts/search?q=&category=
// ────────────────────────────────────────────
export const searchPosts = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const filter = {};

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ title: regex }, { content: regex }];
    }

    if (category && category.trim() && category.trim() !== 'All') {
      filter.category = category.trim();
    }

    const rawPosts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate('author', 'name username');

    const posts = await attachCommentCounts(rawPosts);

    res.status(200).json({
      status: 'success',
      count: posts.length,
      query: { q: q || null, category: category || null },
      posts,
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// GET /api/posts/:id (increments views counter)
// ────────────────────────────────────────────
export const getPostById = async (req, res, next) => {
  try {
    // Atomically increment views counter
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name username email');

    if (!post) {
      return res.status(404).json({ status: 'error', message: 'Post not found' });
    }

    // Attach accurate comment count
    const commentCount = await Comment.countDocuments({ post: post._id });
    const postObj = post.toObject();
    postObj.commentCount = commentCount;
    postObj.likesCount = Array.isArray(post.likes) ? post.likes.length : 0;

    res.status(200).json({ status: 'success', post: postObj });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'error', message: 'Invalid post ID' });
    }
    next(err);
  }
};

// ────────────────────────────────────────────
// GET /api/posts/:id/related (3 other posts from same category)
// ────────────────────────────────────────────
export const getRelatedPosts = async (req, res, next) => {
  try {
    const currentPost = await Post.findById(req.params.id);
    if (!currentPost) {
      return res.status(404).json({ status: 'error', message: 'Post not found' });
    }

    const rawRelated = await Post.find({
      _id: { $ne: currentPost._id },
      category: currentPost.category,
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('author', 'name username');

    const related = await attachCommentCounts(rawRelated);

    res.status(200).json({
      status: 'success',
      count: related.length,
      posts: related,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'error', message: 'Invalid post ID' });
    }
    next(err);
  }
};

// ────────────────────────────────────────────
// POST /api/posts/:id/like (protected, toggle like)
// ────────────────────────────────────────────
export const toggleLikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ status: 'error', message: 'Post not found' });
    }

    const userId = (req.user._id || req.user.id).toString();
    if (!Array.isArray(post.likes)) {
      post.likes = [];
    }

    const hasLiked = post.likes.some((id) => id.toString() === userId);

    if (hasLiked) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(req.user._id || req.user.id);
    }

    await post.save();

    res.status(200).json({
      status: 'success',
      message: hasLiked ? 'Post unliked' : 'Post liked',
      liked: !hasLiked,
      likesCount: post.likes.length,
      likes: post.likes,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'error', message: 'Invalid post ID' });
    }
    next(err);
  }
};

// ────────────────────────────────────────────
// POST /api/posts  (protected, multipart/form-data)
// ────────────────────────────────────────────
export const createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(400).json({
        status: 'error',
        message: 'title, content, and category are required',
      });
    }

    const post = await Post.create({
      title,
      content,
      category,
      author: req.user._id || req.user.id,
      image: req.file ? req.file.filename : null,
      views: 0,
      likes: [],
      commentCount: 0,
    });

    await post.populate('author', 'name username');

    const postObj = post.toObject();
    postObj.commentCount = 0;
    postObj.likesCount = 0;

    res.status(201).json({ status: 'success', message: 'Post created', post: postObj });
  } catch (err) {
    if (req.file) deleteImageFile(req.file.filename);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ status: 'error', message: messages.join('. ') });
    }
    next(err);
  }
};

// ────────────────────────────────────────────
// PUT /api/posts/:id  (protected, author-only)
// ────────────────────────────────────────────
export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(404).json({ status: 'error', message: 'Post not found' });
    }

    // Author-only guard
    const userId = (req.user._id || req.user.id).toString();
    if (post.author.toString() !== userId) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to update this post',
      });
    }

    const { title, content, category } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;

    // If new image provided, delete old image from disk
    if (req.file) {
      deleteImageFile(post.image);
      post.image = req.file.filename;
    }

    await post.save();
    await post.populate('author', 'name username');

    const postObj = post.toObject();
    postObj.likesCount = Array.isArray(post.likes) ? post.likes.length : 0;
    postObj.commentCount = await Comment.countDocuments({ post: post._id });

    res.status(200).json({ status: 'success', message: 'Post updated', post: postObj });
  } catch (err) {
    if (req.file) deleteImageFile(req.file.filename);
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
// DELETE /api/posts/:id  (protected, author-only)
// ────────────────────────────────────────────
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ status: 'error', message: 'Post not found' });
    }

    const userId = (req.user._id || req.user.id).toString();
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to delete this post',
      });
    }

    // Delete image from disk
    if (post.image) {
      deleteImageFile(post.image);
    }

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });

    // Delete the post
    await post.deleteOne();

    res.status(200).json({ status: 'success', message: 'Post and its comments deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'error', message: 'Invalid post ID' });
    }
    next(err);
  }
};
