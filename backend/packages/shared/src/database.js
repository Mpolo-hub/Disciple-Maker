const { Pool } = require('pg');
const logger = require('./logger');

let pool;

function getPool() {
  if (pool) {
    return pool;
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    logger.warn('DATABASE_URL not set, repository will use in-memory store');
    return null;
  }
  pool = new Pool({ connectionString, ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined });
  pool.on('error', (error) => {
    logger.error('Unexpected database error', { error: error.message });
  });
  return pool;
}

async function query(text, params) {
  const activePool = getPool();
  if (!activePool) {
    throw new Error('Database pool unavailable');
  }
  return activePool.query(text, params);
}

module.exports = {
  getPool,
  query
};
