const Joi = require('joi');
const emergencyService = require('../services/emergencyService');

const alertSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  location: Joi.object({ lat: Joi.number().required(), lng: Joi.number().required() }).required(),
  medicalSnapshot: Joi.object().default({}),
  notifyContacts: Joi.boolean().default(true)
});

async function triggerAlert(req, res, next) {
  try {
    const payload = await alertSchema.validateAsync(req.body, { stripUnknown: true });
    const alert = await emergencyService.triggerAlert(payload);
    res.status(202).json(alert);
  } catch (error) {
    next(error);
  }
}

async function acknowledgeAlert(req, res, next) {
  try {
    const alert = await emergencyService.acknowledgeAlert(req.params.id, req.body);
    res.json(alert);
  } catch (error) {
    next(error);
  }
}

async function listAlerts(req, res, next) {
  try {
    const alerts = await emergencyService.listAlerts(req.query.status);
    res.json(alerts);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  triggerAlert,
  acknowledgeAlert,
  listAlerts
};
