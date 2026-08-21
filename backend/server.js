import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars from the root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

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

app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/results', resultsRoutes);

// Groq API Evaluate Route
app.post('/api/evaluate', apiLimiter, async (req, res) => {
  try {
    const { model, response_format, messages } = req.body;
    
    const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server misconfiguration: Missing GROQ_API_KEY' });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "openai/gpt-oss-120b",
        response_format,
        messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `API call failed: ${response.statusText}`, details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Evaluate API Error:", error);
    res.status(500).json({ error: "Failed to evaluate", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
