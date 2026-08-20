/**
 * BRICKSBRAIN-AI Backend Server — Node.js + Express + MongoDB
 * Run: npm install && npm run dev
 */
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const mongoose   = require('mongoose');
const rateLimit  = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// ── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' }));

// ── MongoDB ──────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bricksbrain')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err  => console.error('❌ MongoDB error:', err.message));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/predict',    require('./routes/predict'));
app.use('/api/area',       require('./routes/area'));
app.use('/api/loans',      require('./routes/loans'));
app.use('/api/legal',      require('./routes/legal'));
app.use('/api/chat',       require('./routes/chat'));
app.use('/api/payment',    require('./routes/payment'));
app.use('/api/agent',      require('./routes/agent'));
app.use('/api/reports',    require('./routes/reports'));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  status:    'ok',
  timestamp: new Date().toISOString(),
  env:       process.env.NODE_ENV || 'development',
  db:        mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
}));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.path} not found` }));

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.message);
  res.status(err.status || 500).json({
    error:   err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 BRICKSBRAIN-AI API running at http://localhost:${PORT}`);
  console.log(`📚 Docs: http://localhost:${PORT}/api/health`);
});

module.exports = app;
