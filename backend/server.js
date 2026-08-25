import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

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

// Removed local uploads static serving as we are using Vercel Blob

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

const extractUpload = multer({ storage: multer.memoryStorage() });
app.post('/api/extract-pdf', apiLimiter, extractUpload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    
    // Some CommonJS/ESM interop layers wrap the function in a 'default' property
    const parseFunc = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || pdfParse);
    
    if (typeof parseFunc !== 'function') {
        throw new Error('pdfParse is not a function. It is: ' + typeof parseFunc + ' keys: ' + Object.keys(pdfParse).join(','));
    }

    const data = await parseFunc(req.file.buffer);
    res.json({ text: data.text });
  } catch (error) {
    console.error('PDF Parse Error:', error);
    res.status(500).json({ error: 'Failed to extract text from PDF', details: error.message });
  }
});

app.post('/api/upload-file/token', async (req, res) => {
  try {
    const { handleUpload } = await import('@vercel/blob/client');
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        return {};
      }
    });
    res.json(jsonResponse);
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(400).json({ error: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

export default app;
