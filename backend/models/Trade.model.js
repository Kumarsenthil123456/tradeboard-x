const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  assetName: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true,
    uppercase: true,
    maxlength: [20, 'Asset name cannot exceed 20 characters'],
  },
  assetCategory: {
    type: String,
    enum: ['crypto', 'forex', 'stocks', 'commodities', 'indices'],
    default: 'crypto',
  },
  positionType: {
    type: String,
    enum: ['long', 'short'],
    required: [true, 'Position type is required'],
  },
  entryPrice: {
    type: Number,
    required: [true, 'Entry price is required'],
    min: [0, 'Entry price cannot be negative'],
  },
  exitPrice: {
    type: Number,
    min: [0, 'Exit price cannot be negative'],
    default: null,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
  },
  leverage: {
    type: Number,
    default: 1,
    min: [1, 'Leverage must be at least 1x'],
    max: [125, 'Leverage cannot exceed 125x'],
  },
  stopLoss: {
    type: Number,
    default: null,
  },
  takeProfit: {
    type: Number,
    default: null,
  },
  fees: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'cancelled'],
    default: 'open',
  },
  profitLoss: {
    type: Number,
    default: 0,
  },
  profitLossPercentage: {
    type: Number,
    default: 0,
  },
  tradeNotes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    default: '',
  },
  strategy: {
    type: String,
    enum: ['breakout', 'trend_following', 'mean_reversion', 'scalping', 'arbitrage', 'dca', 'other'],
    default: 'other',
  },
  exchange: {
    type: String,
    trim: true,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  tradeDate: {
    type: Date,
    required: [true, 'Trade date is required'],
    default: Date.now,
  },
  closedAt: {
    type: Date,
    default: null,
  },
  sentiment: {
    type: String,
    enum: ['bullish', 'bearish', 'neutral'],
    default: 'neutral',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for query optimization
tradeSchema.index({ user: 1, status: 1 });
tradeSchema.index({ user: 1, assetName: 1 });
tradeSchema.index({ user: 1, tradeDate: -1 });
tradeSchema.index({ user: 1, profitLoss: -1 });

// Calculate P&L before saving
tradeSchema.pre('save', function (next) {
  if (this.status === 'closed' && this.exitPrice) {
    const priceDiff = this.positionType === 'long'
      ? this.exitPrice - this.entryPrice
      : this.entryPrice - this.exitPrice;

    const rawPnL = priceDiff * this.quantity * this.leverage;
    this.profitLoss = parseFloat((rawPnL - this.fees).toFixed(4));
    this.profitLossPercentage = parseFloat(
      ((priceDiff / this.entryPrice) * 100 * this.leverage).toFixed(2)
    );
    
    if (!this.closedAt) {
      this.closedAt = new Date();
    }
  }
  next();
});

// Virtual: is winning trade
tradeSchema.virtual('isWin').get(function () {
  return this.profitLoss > 0;
});

const Trade = mongoose.model('Trade', tradeSchema);
module.exports = Trade;
