// ✅ FIX 1: dotenv MUST be the absolute first line — before ANY other require()
require('dotenv').config();

// ✅ FIX 2: Fail fast with clear messages if required env vars are missing
const REQUIRED_ENV_VARS = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'];
const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  console.error('\n❌ STARTUP FAILED — Missing required environment variables:');
  missingVars.forEach((key) => console.error(`   • ${key} is not set`));
  console.error('\n👉 Create a file at backend/.env with these values.');
  console.error('   Copy backend/.env.example and fill in your secrets.\n');
  process.exit(1);
}

// ✅ FIX 3: Debug confirmation — shows SET/MISSING without exposing values
console.log('\n✅ Environment variables loaded:');
console.log(`   NODE_ENV           = ${process.env.NODE_ENV || 'development'}`);
console.log(`   PORT               = ${process.env.PORT || 5000}`);
console.log(`   JWT_SECRET         = ${process.env.JWT_SECRET ? '[SET ✓]' : '[MISSING ✗]'}`);
console.log(`   JWT_REFRESH_SECRET = ${process.env.JWT_REFRESH_SECRET ? '[SET ✓]' : '[MISSING ✗]'}`);
console.log(`   MONGODB_URI        = ${process.env.MONGODB_URI ? '[SET ✓]' : '[MISSING ✗]'}`);
console.log(`   CLIENT_URL         = ${process.env.CLIENT_URL || 'http://localhost:3000 (default)'}\n`);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const { userRouter } = require('./routes/user.routes');
const tradeRoutes = require('./routes/trade.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// ✅ FIX 4: CORS — credentials:true required for httpOnly cookie refresh tokens
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'https://tradeboard-x-ssyu.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting — auth gets stricter limit
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // bumped from 10 to 20 so dev testing doesn't get blocked
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use('/api', limiter);
app.use('/api/auth', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ✅ FIX 5: Enhanced health check — confirms JWT secrets and DB state
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TradeBoard X API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    jwt_secret_set: !!process.env.JWT_SECRET,
    jwt_refresh_set: !!process.env.JWT_REFRESH_SECRET,
    mongo_state: mongoose.connection.readyState, // 0=disconnected 1=connected
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRouter);
app.use('/api/trades', tradeRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Centralized error handler
app.use(errorHandler);

// Database connection & server start
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 TradeBoard X API → http://localhost:${PORT}`);
    console.log(`   Health check    → http://localhost:${PORT}/health\n`);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;
