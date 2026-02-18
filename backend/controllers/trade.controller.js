const Trade = require('../models/Trade.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');

const createTrade = async (req, res, next) => {
  try {
    const tradeData = { ...req.body, user: req.userId };
    const trade = await Trade.create(tradeData);
    return successResponse(res, { trade }, 'Trade created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getTrades = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      assetName,
      positionType,
      sortBy = 'tradeDate',
      sortOrder = 'desc',
      search,
      dateFrom,
      dateTo,
      strategy,
    } = req.query;

    const filter = { user: req.userId };

    if (status) filter.status = status;
    if (positionType) filter.positionType = positionType;
    if (strategy) filter.strategy = strategy;
    if (assetName) filter.assetName = assetName.toUpperCase();
    if (search) {
      filter.$or = [
        { assetName: { $regex: search, $options: 'i' } },
        { tradeNotes: { $regex: search, $options: 'i' } },
        { exchange: { $regex: search, $options: 'i' } },
      ];
    }
    if (dateFrom || dateTo) {
      filter.tradeDate = {};
      if (dateFrom) filter.tradeDate.$gte = new Date(dateFrom);
      if (dateTo) filter.tradeDate.$lte = new Date(dateTo);
    }

    const allowedSortFields = ['tradeDate', 'profitLoss', 'entryPrice', 'assetName', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'tradeDate';
    const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [trades, total] = await Promise.all([
      Trade.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Trade.countDocuments(filter),
    ]);

    return paginatedResponse(res, trades, total, page, limit, 'Trades fetched');
  } catch (error) {
    next(error);
  }
};

const getTradeById = async (req, res, next) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, user: req.userId });
    if (!trade) return errorResponse(res, 'Trade not found', 404);
    return successResponse(res, { trade }, 'Trade fetched');
  } catch (error) {
    next(error);
  }
};

const updateTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!trade) return errorResponse(res, 'Trade not found', 404);
    return successResponse(res, { trade }, 'Trade updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!trade) return errorResponse(res, 'Trade not found', 404);
    return successResponse(res, null, 'Trade deleted successfully');
  } catch (error) {
    next(error);
  }
};

const bulkDeleteTrades = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Trade IDs required', 400);
    }
    const result = await Trade.deleteMany({ _id: { $in: ids }, user: req.userId });
    return successResponse(res, { deletedCount: result.deletedCount }, `${result.deletedCount} trades deleted`);
  } catch (error) {
    next(error);
  }
};

module.exports = { createTrade, getTrades, getTradeById, updateTrade, deleteTrade, bulkDeleteTrades };
