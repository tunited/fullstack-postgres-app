import express from 'express';
import { getSummaryReport } from '../controllers/reportController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin only routes
router.get('/summary', authenticateToken, requireAdmin, getSummaryReport);

export default router;
