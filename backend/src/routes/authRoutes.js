import express from 'express';
import { 
  register, 
  login, 
  getProfile,
  getAllUsers,
  updateUser,
  deleteUser,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { authenticateToken, requireAgent } from '../middleware/authMiddleware.js';

const router = express.Router();


// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

// Member Management routes (Agent Only)
router.get('/users', authenticateToken, requireAgent, getAllUsers);
router.put('/users/:id', authenticateToken, requireAgent, updateUser);
router.delete('/users/:id', authenticateToken, requireAgent, deleteUser);

export default router;
