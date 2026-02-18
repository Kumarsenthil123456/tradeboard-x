const express = require('express');
const userRouter = express.Router();
const analyticsRouter = express.Router();
const { getProfile, updateProfile, changePassword, getAllUsers } = require('../controllers/user.controller');
const { getDashboardAnalytics } = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { updateProfileValidation } = require('../middleware/validation.middleware');

// User routes
userRouter.use(authenticate);
userRouter.get('/profile', getProfile);
userRouter.patch('/profile', updateProfileValidation, updateProfile);
userRouter.patch('/change-password', changePassword);
userRouter.get('/all', authorize('admin'), getAllUsers);

// Analytics routes
analyticsRouter.use(authenticate);
analyticsRouter.get('/dashboard', getDashboardAnalytics);

module.exports = { userRouter, analyticsRouter };
