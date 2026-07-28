import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateHandler from './api/generate.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Log incoming API requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Map the Vercel serverless function to /api/generate
app.post('/api/generate', generateHandler);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'SERVER_ERROR',
    message: err.message || 'An unexpected error occurred on the local proxy server.'
  });
});

app.listen(port, () => {
  console.log(`🚀 Local proxy server running on http://localhost:${port}`);
});
