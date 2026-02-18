const User = require('../models/User.model');
const { successResponse, errorResponse } = require('../utils/response.utils');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate('tradesCount');
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, { user }, 'Profile fetched');
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['username', 'bio', 'tradingStyle', 'preferredAssets', 'avatar'];
    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId).select('+password');

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) return errorResponse(res, 'Current password is incorrect', 400);

    user.password = newPassword;
    await user.save();

    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// Admin only
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(parseInt(limit)).select('-refreshTokens'),
      User.countDocuments(filter),
    ]);
    return successResponse(res, { users, total, page: parseInt(page) }, 'Users fetched');
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, changePassword, getAllUsers };
