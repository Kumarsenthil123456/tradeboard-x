const Trade = require('../models/Trade.model');
const { successResponse } = require('../utils/response.utils');

const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { period = '30d' } = req.query;

    // Date filter
    const periodMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365, 'all': null };
    const days = periodMap[period];
    const dateFilter = days ? { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } : null;
    const baseFilter = { user: userId, ...(dateFilter && { tradeDate: dateFilter }) };

    // Core aggregations
    const [summary, assetBreakdown, dailyPnL, strategyStats, recentTrades] = await Promise.all([
      // Summary stats
      Trade.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: null,
            totalTrades: { $sum: 1 },
            totalPnL: { $sum: '$profitLoss' },
            winningTrades: { $sum: { $cond: [{ $gt: ['$profitLoss', 0] }, 1, 0] } },
            losingTrades: { $sum: { $cond: [{ $lt: ['$profitLoss', 0] }, 1, 0] } },
            openTrades: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
            closedTrades: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
            avgProfit: { $avg: { $cond: [{ $gt: ['$profitLoss', 0] }, '$profitLoss', null] } },
            avgLoss: { $avg: { $cond: [{ $lt: ['$profitLoss', 0] }, '$profitLoss', null] } },
            bestTrade: { $max: '$profitLoss' },
            worstTrade: { $min: '$profitLoss' },
            totalLong: { $sum: { $cond: [{ $eq: ['$positionType', 'long'] }, 1, 0] } },
            totalShort: { $sum: { $cond: [{ $eq: ['$positionType', 'short'] }, 1, 0] } },
          },
        },
      ]),

      // Asset breakdown
      Trade.aggregate([
        { $match: { ...baseFilter, status: 'closed' } },
        {
          $group: {
            _id: '$assetName',
            totalTrades: { $sum: 1 },
            totalPnL: { $sum: '$profitLoss' },
            wins: { $sum: { $cond: [{ $gt: ['$profitLoss', 0] }, 1, 0] } },
          },
        },
        { $sort: { totalPnL: -1 } },
        { $limit: 10 },
      ]),

      // Daily P&L for chart
      Trade.aggregate([
        { $match: { ...baseFilter, status: 'closed' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$closedAt' } },
            dailyPnL: { $sum: '$profitLoss' },
            trades: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 90 },
      ]),

      // Strategy stats
      Trade.aggregate([
        { $match: { ...baseFilter, status: 'closed' } },
        {
          $group: {
            _id: '$strategy',
            count: { $sum: 1 },
            pnl: { $sum: '$profitLoss' },
            wins: { $sum: { $cond: [{ $gt: ['$profitLoss', 0] }, 1, 0] } },
          },
        },
        { $sort: { pnl: -1 } },
      ]),

      // Recent trades
      Trade.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('assetName positionType profitLoss status tradeDate entryPrice exitPrice'),
    ]);

    const stats = summary[0] || {
      totalTrades: 0, totalPnL: 0, winningTrades: 0, losingTrades: 0,
      openTrades: 0, closedTrades: 0, avgProfit: 0, avgLoss: 0,
      bestTrade: 0, worstTrade: 0, totalLong: 0, totalShort: 0,
    };

    const winRate = stats.closedTrades > 0
      ? parseFloat(((stats.winningTrades / stats.closedTrades) * 100).toFixed(1))
      : 0;

    const profitFactor = stats.avgLoss && stats.avgLoss !== 0
      ? parseFloat(Math.abs(stats.avgProfit / stats.avgLoss).toFixed(2))
      : null;

    return successResponse(res, {
      summary: { ...stats, winRate, profitFactor },
      assetBreakdown,
      dailyPnL,
      strategyStats,
      recentTrades,
    }, 'Analytics fetched');
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardAnalytics };
