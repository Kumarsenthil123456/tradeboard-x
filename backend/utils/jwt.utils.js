const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// ✅ FIX: Guard function — throws a clear, actionable error instead of the
// cryptic "secretOrPrivateKey must have a value" from jsonwebtoken.
// Reading inside functions (not at top level) ensures dotenv has already run.
function requireSecret(value, name) {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `[jwt.utils] ${name} is not set. ` +
      `Ensure backend/.env exists and contains ${name}=<value>. ` +
      `Also confirm require('dotenv').config() is the FIRST line in server.js.`
    );
  }
  return value;
}

// ─── Access Token ─────────────────────────────────────────────────────────────

const generateAccessToken = (payload) => {
  // ✅ Read env var INSIDE the function — never at top/module level
  const secret = requireSecret(process.env.JWT_SECRET, 'JWT_SECRET');
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    issuer: 'tradeboard-x',
    audience: 'tradeboard-x-client',
  });
};

const verifyAccessToken = (token) => {
  const secret = requireSecret(process.env.JWT_SECRET, 'JWT_SECRET');
  return jwt.verify(token, secret, {
    issuer: 'tradeboard-x',
    audience: 'tradeboard-x-client',
  });
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

const generateRefreshToken = (payload) => {
  const secret = requireSecret(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET');
  return jwt.sign(
    { ...payload, jti: uuidv4() },
    secret,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: 'tradeboard-x',
      audience: 'tradeboard-x-client',
    }
  );
};

const verifyRefreshToken = (token) => {
  const secret = requireSecret(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET');
  return jwt.verify(token, secret, {
    issuer: 'tradeboard-x',
    audience: 'tradeboard-x-client',
  });
};

// ─── Cookie Helpers ───────────────────────────────────────────────────────────

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,                                         // JS cannot read (XSS safe)
    secure: process.env.NODE_ENV === 'production',          // HTTPS only in prod
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // lax for dev
    maxAge: 7 * 24 * 60 * 60 * 1000,                       // 7 days
    path: '/api/auth/refresh',                              // Only sent to refresh endpoint
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/api/auth/refresh',
  });
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
