/**
 * Seed script - creates demo data for TradeBoard X
 * Run: node utils/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User.model');
const Trade = require('../models/Trade.model');

const ASSETS = ['BTC', 'ETH', 'SOL', 'BNB', 'AVAX', 'MATIC', 'LINK', 'ADA'];
const STRATEGIES = ['breakout', 'trend_following', 'mean_reversion', 'scalping', 'dca', 'other'];
const EXCHANGES = ['Binance', 'Coinbase', 'Bybit', 'OKX', 'Kraken'];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tradeboard_x');
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Trade.deleteMany({});
  console.log('🧹 Cleared existing data');

  // Create admin user
  const admin = await User.create({
    username: 'admin',
    email: 'admin@tradeboard.com',
    password: 'Admin123!',
    role: 'admin',
    tradingStyle: 'swing_trader',
    bio: 'Platform administrator and professional swing trader',
  });

  // Create demo trader
  const trader = await User.create({
    username: 'demotrader',
    email: 'demo@tradeboard.com',
    password: 'Demo123!',
    role: 'user',
    tradingStyle: 'day_trader',
    bio: 'Day trader specializing in crypto and forex',
    preferredAssets: ['BTC', 'ETH', 'SOL'],
  });

  console.log('👤 Created users: admin@tradeboard.com / Admin123! | demo@tradeboard.com / Demo123!');

  // Generate 50 trades for demo trader
  const trades = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(randomBetween(1, 120));
    const tradeDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    const asset = randomChoice(ASSETS);
    const position = Math.random() > 0.5 ? 'long' : 'short';
    const entryPrice = randomBetween(10, 50000);
    const isClosed = Math.random() > 0.2;
    const isWin = Math.random() > 0.4;

    let exitPrice = null;
    let status = 'open';

    if (isClosed) {
      status = 'closed';
      const changePercent = isWin
        ? randomBetween(0.5, 15) / 100
        : randomBetween(0.5, 8) / 100;

      exitPrice = position === 'long'
        ? entryPrice * (1 + changePercent)
        : entryPrice * (1 - changePercent);
    }

    trades.push({
      user: trader._id,
      assetName: asset,
      assetCategory: 'crypto',
      positionType: position,
      entryPrice: parseFloat(entryPrice.toFixed(4)),
      exitPrice: exitPrice ? parseFloat(exitPrice.toFixed(4)) : null,
      quantity: parseFloat(randomBetween(0.01, 5).toFixed(4)),
      leverage: randomChoice([1, 2, 3, 5, 10]),
      fees: parseFloat(randomBetween(0.5, 20).toFixed(2)),
      status,
      strategy: randomChoice(STRATEGIES),
      exchange: randomChoice(EXCHANGES),
      tradeDate,
      closedAt: isClosed ? new Date(tradeDate.getTime() + randomBetween(1, 48) * 60 * 60 * 1000) : null,
      tradeNotes: Math.random() > 0.5 ? `${position === 'long' ? 'Bullish' : 'Bearish'} setup on ${asset}. ${randomChoice(['Strong momentum', 'Breakout confirmed', 'Support test', 'Resistance break'])}.` : '',
      sentiment: randomChoice(['bullish', 'bearish', 'neutral']),
    });
  }

  await Trade.create(trades);
  console.log('📊 Created 50 sample trades');

  await mongoose.connection.close();
  console.log('✅ Seed complete! Ready to run: npm run dev');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
