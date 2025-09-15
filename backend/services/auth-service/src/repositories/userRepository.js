const { getPool, logger } = require('@employee-health/shared');
const crypto = require('crypto');

const usersByEmail = new Map();
const usersById = new Map();

function sanitize(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    locale: user.locale
  };
}

async function create({ email, passwordHash, locale, role = 'employee' }) {
  const id = crypto.randomUUID();
  const record = { id, email, passwordHash, locale, role, refreshTokens: new Set() };
  const pool = getPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO users (id, email, password_hash, preferred_locale, role)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, email, passwordHash, locale, role]
      );
    } catch (error) {
      logger.error('Failed to persist user, fallback to memory', { error: error.message });
    }
  }
  usersByEmail.set(email, record);
  usersById.set(id, record);
  return sanitize(record);
}

async function findByEmail(email) {
  const memory = usersByEmail.get(email);
  if (memory) {
    return memory;
  }
  const pool = getPool();
  if (!pool) {
    return null;
  }
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    if (!rows.length) return null;
    const row = rows[0];
    const record = {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      locale: row.preferred_locale,
      refreshTokens: new Set()
    };
    usersByEmail.set(email, record);
    usersById.set(record.id, record);
    return record;
  } catch (error) {
    logger.error('Failed to fetch user from database', { error: error.message });
    return null;
  }
}

async function findById(id) {
  const memory = usersById.get(id);
  if (memory) {
    return memory;
  }
  const pool = getPool();
  if (!pool) {
    return null;
  }
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    if (!rows.length) return null;
    const row = rows[0];
    const record = {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      locale: row.preferred_locale,
      refreshTokens: new Set()
    };
    usersByEmail.set(record.email, record);
    usersById.set(record.id, record);
    return record;
  } catch (error) {
    logger.error('Failed to fetch user by id from database', { error: error.message });
    return null;
  }
}

async function storeRefreshToken(userId, token) {
  const user = usersById.get(userId);
  if (user) {
    user.refreshTokens.add(token);
  }
}

async function isRefreshTokenValid(userId, token) {
  const user = usersById.get(userId);
  if (!user) return false;
  return user.refreshTokens.has(token);
}

module.exports = {
  create,
  findByEmail,
  findById,
  storeRefreshToken,
  isRefreshTokenValid,
  sanitize
};
