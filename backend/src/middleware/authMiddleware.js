import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeyforapexsupportdesk2026!';

import pool from '../config/db.js';

// Middleware to authenticate JWT token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Token format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    
    // Fetch fresh user role and base_role from DB to prevent stale JWT role issues
    const result = await pool.query(`
      SELECT u.role as user_role, r.base_role 
      FROM users u 
      LEFT JOIN roles r ON LOWER(u.role) = LOWER(r.name) 
      WHERE u.id = $1
    `, [verified.id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found.' });
    }
    
    req.user = verified; // Contains id, email, name from token
    req.user.user_role = result.rows[0].user_role; // The actual role name (e.g., 'Senior Support')
    // Fallback to user_role if base_role is not found (for backwards compatibility)
    req.user.role = result.rows[0].base_role || result.rows[0].user_role; 
    
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// Middleware to authorize specific role: agent or admin
export const requireAgent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Access denied. User not authenticated.' });
  }

  if (req.user.role !== 'agent' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Agent or Admin role required.' });
  }

  next();
};

// Middleware to authorize specific role: admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Access denied. User not authenticated.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }

  next();
};
