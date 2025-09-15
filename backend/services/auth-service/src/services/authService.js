const bcrypt = require('bcryptjs');
const repository = require('../repositories/userRepository');
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require('@employee-health/shared');

async function register({ email, password, locale }) {
  const existing = await repository.findByEmail(email);
  if (existing) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await repository.create({ email, passwordHash, locale });
  const accessToken = createAccessToken({ sub: user.id, email: user.email, role: user.role, locale: user.locale });
  const refreshToken = createRefreshToken({ sub: user.id, email: user.email, role: user.role });
  await repository.storeRefreshToken(user.id, refreshToken);
  return { ...user, accessToken, refreshToken };
}

async function login({ email, password }) {
  const user = await repository.findByEmail(email);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  const sanitized = repository.sanitize(user);
  const accessToken = createAccessToken({ sub: sanitized.id, email: sanitized.email, role: sanitized.role, locale: sanitized.locale });
  const refreshToken = createRefreshToken({ sub: sanitized.id, email: sanitized.email, role: sanitized.role });
  await repository.storeRefreshToken(sanitized.id, refreshToken);
  return { user: sanitized, accessToken, refreshToken };
}

async function refreshToken(token) {
  const payload = verifyRefreshToken(token);
  if (!payload) {
    const error = new Error('Invalid refresh token');
    error.status = 401;
    throw error;
  }
  const isValid = await repository.isRefreshTokenValid(payload.sub, token);
  if (!isValid) {
    const error = new Error('Refresh token revoked');
    error.status = 403;
    throw error;
  }
  const user = await repository.findById(payload.sub);
  const sanitized = repository.sanitize(user);
  const accessToken = createAccessToken({ sub: sanitized.id, email: sanitized.email, role: sanitized.role });
  const refreshToken = createRefreshToken({ sub: sanitized.id, email: sanitized.email, role: sanitized.role });
  await repository.storeRefreshToken(sanitized.id, refreshToken);
  return { accessToken, refreshToken };
}

module.exports = {
  register,
  login,
  refreshToken
};
