import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import db from './lib/db.js';
import User from './models/User.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import siteSettingsRoutes from './routes/siteSettingsRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
// Split comma-separated FRONTEND_URL into an array so the cors middleware
// echoes a single, valid Access-Control-Allow-Origin per request. Sending a
// comma-joined string is rejected by browsers ("Failed to fetch").
const allowedOrigins = (process.env.FRONTEND_URL || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/settings', siteSettingsRoutes);

// Root route — used by Elastic Beanstalk / load-balancer health checks.
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/api', (req, res) => {
  res.json({ message: 'SAVANT Backend API', version: '1.0.0' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Start the server. On Elastic Beanstalk / Render this runs as a real Node
// process. We connect to MongoDB (Atlas) first; if MONGODB_URI is missing the
// connection helper only warns, so the server still boots (DB calls 500 until
// it's configured). EB health-checks the root `/` route.
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await db.connect(process.env.MONGODB_URI);

    // Auto-seed once: if there are no users yet, populate initial data so the
    // store works immediately after a fresh deploy (no manual `eb ssh` needed).
    try {
      if ((await User.countDocuments()) === 0) {
        console.log('[seed] database empty — running seed...');
        const seedDatabase = (await import('./seed.js')).default;
        await seedDatabase();
        console.log('[seed] done');
      }
    } catch (seedErr) {
      console.error('[seed] skipped:', seedErr.message);
    }
  } catch (err) {
    console.error('MongoDB connect failed at startup:', err.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

export default app;
