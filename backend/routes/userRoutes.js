import { Router } from 'express';
import { getUserById, getUserPosts } from '../controllers/userController.js';

const router = Router();

router.get('/:id', getUserById);
router.get('/:id/posts', getUserPosts);

export default router;
