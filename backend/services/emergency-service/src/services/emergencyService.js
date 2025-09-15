const repository = require('../repositories/emergencyRepository');
const { recordAudit } = require('@employee-health/shared');

async function triggerAlert(payload) {
  const alert = await repository.createAlert(payload);
  await recordAudit({
    userId: payload.userId,
    action: 'emergency_alert_triggered',
    resourceType: 'emergency_alert',
    resourceId: alert.id,
    metadata: { location: payload.location, notifyContacts: payload.notifyContacts }
  });
  return {
    ...alert,
    notifications: payload.notifyContacts ? ['sms', 'email', 'push'] : []
  };
}

async function acknowledgeAlert(id, payload = {}) {
  const alert = await repository.updateAlert(id, { status: 'acknowledged', responder: payload.responder || 'medical_team' });
  await recordAudit({
    userId: payload.responderId || null,
    actorRole: 'medical_staff',
    action: 'emergency_alert_acknowledged',
    resourceType: 'emergency_alert',
    resourceId: id
  });
  return alert;
}

async function listAlerts(status) {
  return repository.list(status);
}

module.exports = {
  triggerAlert,
  acknowledgeAlert,
  listAlerts
};
