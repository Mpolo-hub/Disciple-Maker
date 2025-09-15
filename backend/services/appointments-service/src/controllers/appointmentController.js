const Joi = require('joi');
const appointmentService = require('../services/appointmentService');

const createSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  practitionerId: Joi.string().uuid().required(),
  scheduledAt: Joi.date().iso().required(),
  mode: Joi.string().valid('onsite', 'teleconsultation').default('onsite'),
  notes: Joi.string().allow('', null)
});

const updateSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed'),
  scheduledAt: Joi.date().iso(),
  notes: Joi.string().allow('', null)
}).min(1);

async function listAppointments(req, res, next) {
  try {
    const result = await appointmentService.listAppointments({ status: req.query.status, userId: req.headers['x-user-id'] });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function createAppointment(req, res, next) {
  try {
    const payload = await createSchema.validateAsync(req.body, { stripUnknown: true });
    const appointment = await appointmentService.createAppointment(payload);
    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
}

async function updateAppointment(req, res, next) {
  try {
    const payload = await updateSchema.validateAsync(req.body, { stripUnknown: true });
    const appointment = await appointmentService.updateAppointment(req.params.id, payload);
    res.json(appointment);
  } catch (error) {
    next(error);
  }
}

async function getAvailability(req, res, next) {
  try {
    const slots = await appointmentService.getAvailability(req.query.practitionerId);
    res.json(slots);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listAppointments,
  createAppointment,
  updateAppointment,
  getAvailability
};
