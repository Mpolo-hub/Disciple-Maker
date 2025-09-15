const { query, getPool } = require('@employee-health/shared');

const fallbackAudit = [];
const fallbackIncidents = [];

async function getMetrics(since) {
  const pool = getPool();
  if (pool) {
    const { rows } = await query(
      `SELECT date_trunc('day', scheduled_at) AS day, COUNT(*) FILTER (WHERE mode = 'teleconsultation') AS teleconsultations,
              COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
              COUNT(*) AS total
         FROM appointments
        WHERE ($1::timestamptz IS NULL OR scheduled_at >= $1)
        GROUP BY 1
        ORDER BY 1 DESC
        LIMIT 30`,
      [since ? new Date(since) : null]
    );
    return { since: since || null, trends: rows };
  }
  return {
    since: since || null,
    trends: [
      { day: new Date().toISOString(), teleconsultations: 4, cancelled: 1, total: 12 },
      { day: new Date(Date.now() - 86400000).toISOString(), teleconsultations: 6, cancelled: 0, total: 15 }
    ]
  };
}

async function listAuditLogs(filters) {
  const pool = getPool();
  if (pool) {
    const { rows } = await query(
      `SELECT id, user_id, actor_role, action, resource_type, created_at
         FROM audit_logs
        WHERE ($1::uuid IS NULL OR user_id = $1)
        ORDER BY created_at DESC
        LIMIT 100`,
      [filters.userId || null]
    );
    return rows;
  }
  return fallbackAudit;
}

async function listIncidents() {
  const pool = getPool();
  if (pool) {
    const { rows } = await query(
      `SELECT id, status, triggered_at
         FROM emergency_alerts
        ORDER BY triggered_at DESC
        LIMIT 50`
    );
    return rows;
  }
  if (!fallbackIncidents.length) {
    fallbackIncidents.push({ id: 'demo-1', status: 'resolved', triggered_at: new Date().toISOString() });
  }
  return fallbackIncidents;
}

module.exports = {
  getMetrics,
  listAuditLogs,
  listIncidents
};
