const { getPool, logger } = require('@employee-health/shared');
const crypto = require('crypto');

const appointments = new Map();

function sanitize(record) {
  return { ...record };
}

async function list(filters = {}) {
  const data = Array.from(appointments.values());
  return data.filter((item) => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.userId && item.userId !== filters.userId) return false;
    return true;
  });
}

async function create(payload) {
  const id = crypto.randomUUID();
  const record = {
    id,
    ...payload,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  appointments.set(id, record);
  const pool = getPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO appointments (id, user_id, practitioner_id, scheduled_at, mode, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, payload.userId, payload.practitionerId, payload.scheduledAt, payload.mode, record.status, payload.notes]
      );
    } catch (error) {
      logger.error('Failed to persist appointment', { error: error.message });
    }
  }
  return sanitize(record);
}

async function update(id, payload) {
  const existing = appointments.get(id);
  if (!existing) {
    const error = new Error('Appointment not found');
    error.status = 404;
    throw error;
  }
  const updated = { ...existing, ...payload, updatedAt: new Date().toISOString() };
  appointments.set(id, updated);
  const pool = getPool();
  if (pool) {
    try {
      await pool.query(
        `UPDATE appointments SET scheduled_at = $2, status = $3, notes = $4, updated_at = NOW() WHERE id = $1`,
        [id, updated.scheduledAt, updated.status, updated.notes]
      );
    } catch (error) {
      logger.error('Failed to update appointment in database', { error: error.message });
    }
  }
  return sanitize(updated);
}

module.exports = {
  list,
  create,
  update
};
