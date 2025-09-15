const { getPool, encryptData, decryptData, logger } = require('@employee-health/shared');
const crypto = require('crypto');

const alerts = new Map();

function sanitize(alert) {
  return { ...alert, medicalSnapshot: alert.medicalSnapshot };
}

async function createAlert(payload) {
  const id = crypto.randomUUID();
  const record = {
    id,
    userId: payload.userId,
    location: payload.location,
    medicalSnapshot: payload.medicalSnapshot,
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  alerts.set(id, record);
  const pool = getPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO emergency_alerts (id, user_id, location, status, medical_snapshot)
         VALUES ($1, $2, $3, $4, $5)` ,
        [id, payload.userId, encryptData(payload.location), record.status, encryptData(payload.medicalSnapshot)]
      );
    } catch (error) {
      logger.error('Failed to persist emergency alert', { error: error.message });
    }
  }
  return sanitize(record);
}

async function updateAlert(id, changes) {
  const alert = alerts.get(id);
  if (!alert) {
    const error = new Error('Alert not found');
    error.status = 404;
    throw error;
  }
  const updated = { ...alert, ...changes, updatedAt: new Date().toISOString() };
  alerts.set(id, updated);
  const pool = getPool();
  if (pool) {
    try {
      await pool.query(
        `UPDATE emergency_alerts SET status = $2, medical_snapshot = $3, updated_at = NOW() WHERE id = $1`,
        [id, updated.status, encryptData(updated.medicalSnapshot)]
      );
    } catch (error) {
      logger.error('Failed to update emergency alert', { error: error.message });
    }
  }
  return sanitize(updated);
}

async function list(status) {
  const data = Array.from(alerts.values());
  return data.filter((item) => (status ? item.status === status : true)).map(sanitize);
}

module.exports = {
  createAlert,
  updateAlert,
  list
};
