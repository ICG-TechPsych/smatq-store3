// Load environment variables FIRST
import './config.js';

import express from 'express';
import cors from 'cors';
import paymentRoutes from './routes/payments.js';
import webhookRoutes from './routes/webhooks.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import { initializeDatabase, seedDefaultProducts } from './db/schema.js';

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:3000',
      'https://smatq-store.vercel.app'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Explicit OPTIONS handler for preflight requests
app.options('*', cors(corsOptions));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Initialize database and start server
(async () => {
  try {
    await initializeDatabase();
    await seedDefaultProducts();
    console.log('✅ Database initialized and ready');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    if (process.env.NODE_ENV === 'production') {
      // In production, continue anyway - tables might already exist
      console.log('Continuing despite error...');
    }
  }

  app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
    console.log(`🔐 Snippe Integration Ready`);
    console.log(`📦 Database: PostgreSQL`);
  });
})();
