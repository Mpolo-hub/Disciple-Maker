const Joi = require('joi');
const triageService = require('../services/triageService');

const startSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  symptoms: Joi.array().items(Joi.string().min(2)).min(1).required()
});

const responseSchema = Joi.object({
  stepId: Joi.string().required(),
  answer: Joi.alternatives(Joi.string(), Joi.boolean(), Joi.number(), Joi.object()).required()
});

async function getProtocols(req, res, next) {
  try {
    res.json({ protocols: triageService.getProtocols() });
  } catch (error) {
    next(error);
  }
}

async function startSession(req, res, next) {
  try {
    const payload = await startSchema.validateAsync(req.body, { stripUnknown: true });
    const session = await triageService.startSession(payload);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
}

async function submitResponse(req, res, next) {
  try {
    const payload = await responseSchema.validateAsync(req.body, { stripUnknown: true });
    const session = await triageService.submitResponse(req.params.id, payload);
    res.json(session);
  } catch (error) {
    next(error);
  }
}

async function getSession(req, res, next) {
  try {
    const session = await triageService.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProtocols,
  startSession,
  submitResponse,
  getSession
};
