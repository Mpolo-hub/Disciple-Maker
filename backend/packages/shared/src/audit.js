const logger = require('./logger');
const { query, getPool } = require('./database');

async function recordAudit({ userId = null, actorRole = 'system', action, resourceType, resourceId = null, metadata = {}, ipAddress = null, userAgent = null }) {
  const payloadHash = metadata ? require('crypto').createHash('sha256').update(JSON.stringify(metadata)).digest('hex') : null;
  const pool = getPool();
  if (!pool) {
    logger.info('Audit (memory fallback)', { userId, action, resourceType, resourceId, metadata });
    return;
  }
  await query(
    `INSERT INTO audit_logs (user_id, actor_role, action, resource_type, resource_id, ip_address, user_agent, payload_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [userId, actorRole, action, resourceType, resourceId, ipAddress, userAgent, payloadHash]
  );
}

module.exports = {
  recordAudit
};
