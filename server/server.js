import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars from the frontend .env for convenience, or server .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../ielts-app/.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, { dbName: 'IELTS_Prep_DB' })
  .then(() => console.log('✅ Connected to MongoDB (MotoBuild Cluster - IELTS_Prep_DB)'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Basic Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IELTS Prep API is running' });
});

import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import settingsRoutes from './routes/settings.js';
import resultsRoutes from './routes/results.js';

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/results', resultsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
