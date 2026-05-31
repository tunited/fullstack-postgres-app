import express from 'express';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController.js';
import { authenticateToken, requireAgent } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getCustomers);

router.post('/', authenticateToken, requireAgent, createCustomer);
router.put('/:id', authenticateToken, requireAgent, updateCustomer);
router.delete('/:id', authenticateToken, requireAgent, deleteCustomer);

export default router;
