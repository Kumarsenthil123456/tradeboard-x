const User = require('../models/User.model');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require('../utils/jwt.utils');
const { successResponse, errorResponse } = require('../utils/response.utils');

// ─── Register ─────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { username, email, password, tradingStyle } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return errorResponse(
        res,
        existingUser.email === email ? 'Email already registered' : 'Username already taken',
        409
      );
    }

    const user = await User.create({
      username,
      email,
      password,
      tradingStyle: tradingStyle || 'day_trader',
    });

    const tokenPayload = { userId: user._id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.refreshTokens.push({ token: refreshToken, expiresAt: refreshExpiry });
    user.lastLogin = new Date();
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    return successResponse(res, { user, accessToken }, 'Registration successful', 201);
  } catch (error) {
    console.error('[register] error:', error.message);
    next(error);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ✅ FIX: Validate inputs before hitting DB
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    // ✅ FIX: Debug log — confirms secrets are available at call time
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[login] attempt for: ${email}`);
      console.log(`[login] JWT_SECRET set: ${!!process.env.JWT_SECRET}`);
      console.log(`[login] JWT_REFRESH_SECRET set: ${!!process.env.JWT_REFRESH_SECRET}`);
    }

    // ✅ FIX: Must use .select('+password') — password has select:false in schema
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[login] no user found for: ${email}`);
      }
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[login] wrong password for: ${email}`);
      }
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const tokenPayload = { userId: user._id, email: user.email, role: user.role };

    // ✅ These calls will throw a clear error if JWT_SECRET is still undefined
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    user.cleanExpiredTokens();
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.refreshTokens.push({ token: refreshToken, expiresAt: refreshExpiry });
    user.lastLogin = new Date();
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[login] ✅ success for: ${email}`);
    }

    return successResponse(res, { user, accessToken }, 'Login successful');
  } catch (error) {
    // ✅ FIX: Log the real error so you can see it in the backend terminal
    console.error('[login] ❌ error:', error.message);
    next(error);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken && req.user) {
      req.user.refreshTokens = req.user.refreshTokens.filter(
        (t) => t.token !== refreshToken
      );
      await req.user.save();
    }

    clearRefreshTokenCookie(res);
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return errorResponse(res, 'Refresh token required', 401);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      clearRefreshTokenCookie(res);
      const message = err.name === 'TokenExpiredError'
        ? 'Session expired, please log in again'
        : 'Invalid refresh token';
      return errorResponse(res, message, 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      clearRefreshTokenCookie(res);
      return errorResponse(res, 'User not found', 401);
    }

    const storedToken = user.refreshTokens.find((t) => t.token === token);
    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Possible token reuse attack — clear all sessions
      user.refreshTokens = [];
      await user.save();
      clearRefreshTokenCookie(res);
      return errorResponse(res, 'Refresh token revoked', 401);
    }

    const tokenPayload = { userId: user._id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Rotate: remove old, add new
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.refreshTokens.push({ token: newRefreshToken, expiresAt: refreshExpiry });
    user.cleanExpiredTokens();
    await user.save();

    setRefreshTokenCookie(res, newRefreshToken);

    return successResponse(res, { accessToken: newAccessToken }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

// ─── Get Me ───────────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate('tradesCount');
    return successResponse(res, { user }, 'Profile fetched');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, refreshToken, getMe };
