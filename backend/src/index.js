import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import pool from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity, can restrict in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Main Root endpoint for status check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'PPCC Care API is healthy and running.' });
});

// Serve static uploaded files
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/customers', customerRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Run database schema migration/checks on startup
const initDatabaseSchema = async () => {
  try {
    console.log('🔄 Checking database schema compatibility...');
    
    // Add is_verified column to users table if it does not exist
    // Default to true for existing rows, but default to false for any subsequent inserts
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE;
    `);
    
    await pool.query(`
      ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT FALSE;
    `);
    
    console.log('✅ Database schema checks completed successfully.');
  } catch (error) {
    console.error('❌ Database schema migration failed:', error);
  }
};

// Start Server
const startServer = async () => {
  await initDatabaseSchema();
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 PPCC Care Server running on port ${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`=================================================`);
  });
};

startServer();
