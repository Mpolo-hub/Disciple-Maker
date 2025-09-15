const jwt = require('jsonwebtoken');
const logger = require('./logger');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh';

function createAccessToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: options.expiresIn || '15m',
    audience: options.audience || 'employee-health-app',
    issuer: 'employee-health-platform',
    ...options
  });
}

function createRefreshToken(payload, options = {}) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: options.expiresIn || '7d',
    audience: options.audience || 'employee-health-app',
    issuer: 'employee-health-platform',
    ...options
  });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    logger.warn('Invalid access token', { error: error.message });
    return null;
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    logger.warn('Invalid refresh token', { error: error.message });
    return null;
  }
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
