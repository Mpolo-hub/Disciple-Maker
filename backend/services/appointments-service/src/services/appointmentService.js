const { addMinutes, startOfDay, formatISO } = require('date-fns');
const repository = require('../repositories/appointmentRepository');
const { recordAudit } = require('@employee-health/shared');

async function listAppointments(filters) {
  return repository.list(filters);
}

async function createAppointment(payload) {
  const appointment = await repository.create(payload);
  await recordAudit({
    userId: payload.userId,
    action: 'appointment_created',
    resourceType: 'appointment',
    resourceId: appointment.id,
    metadata: { practitionerId: payload.practitionerId, scheduledAt: payload.scheduledAt }
  });
  return appointment;
}

async function updateAppointment(id, payload) {
  const appointment = await repository.update(id, payload);
  await recordAudit({
    userId: appointment.userId,
    action: 'appointment_updated',
    resourceType: 'appointment',
    resourceId: id,
    metadata: payload
  });
  return appointment;
}

async function getAvailability(practitionerId) {
  const base = startOfDay(new Date());
  const slots = [];
  for (let i = 9 * 60; i < 17 * 60; i += 30) {
    const date = addMinutes(base, i);
    slots.push({
      practitionerId: practitionerId || 'default',
      start: formatISO(date),
      end: formatISO(addMinutes(date, 30))
    });
  }
  return { practitionerId: practitionerId || 'default', slots };
}

module.exports = {
  listAppointments,
  createAppointment,
  updateAppointment,
  getAvailability
};
