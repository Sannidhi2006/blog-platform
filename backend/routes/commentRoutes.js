import { Router } from 'express';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';
import protect from '../middleware/auth.js';

const router = Router();

router.get('/:postId', getComments);
router.post('/:postId', protect, createComment);
router.put('/:commentId', protect, updateComment);
router.delete('/:commentId', protect, deleteComment);

export default router;
