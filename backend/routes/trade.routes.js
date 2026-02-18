const express = require('express');
const router = express.Router();
const {
  createTrade, getTrades, getTradeById, updateTrade, deleteTrade, bulkDeleteTrades
} = require('../controllers/trade.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { tradeValidation } = require('../middleware/validation.middleware');

router.use(authenticate);

router.route('/')
  .get(getTrades)
  .post(tradeValidation, createTrade);

router.delete('/bulk', bulkDeleteTrades);

router.route('/:id')
  .get(getTradeById)
  .put(tradeValidation, updateTrade)
  .patch(updateTrade)
  .delete(deleteTrade);

module.exports = router;
