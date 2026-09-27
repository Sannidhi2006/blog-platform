import { Router } from 'express';
import {
  getPosts,
  searchPosts,
  getPostById,
  getRelatedPosts,
  toggleLikePost,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import protect from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

// Public routes
router.get('/', getPosts);
router.get('/search', searchPosts);
router.get('/:id', getPostById);
router.get('/:id/related', getRelatedPosts);

// Protected routes
router.post('/', protect, upload.single('image'), createPost);
router.post('/:id/like', protect, toggleLikePost);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);

export default router;
