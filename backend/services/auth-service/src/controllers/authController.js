const Joi = require('joi');
const authService = require('../services/authService');
const { recordAudit } = require('@employee-health/shared');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  locale: Joi.string().default('fr')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

async function register(req, res, next) {
  try {
    const payload = await registerSchema.validateAsync(req.body, { stripUnknown: true });
    const result = await authService.register(payload);
    await recordAudit({
      userId: result.id,
      actorRole: 'employee',
      action: 'register',
      resourceType: 'user',
      resourceId: result.id,
      metadata: { email: result.email }
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const payload = await loginSchema.validateAsync(req.body, { stripUnknown: true });
    const tokens = await authService.login(payload);
    await recordAudit({
      userId: tokens.user.id,
      actorRole: tokens.user.role,
      action: 'login',
      resourceType: 'user',
      resourceId: tokens.user.id
    });
    res.json(tokens);
  } catch (error) {
    next(error);
  }
}

async function refreshToken(req, res, next) {
  try {
    const tokens = await authService.refreshToken(req.body.refreshToken);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
}

async function listProviders(req, res) {
  res.json({ providers: ['azure-ad', 'google', 'okta'] });
}

async function oauthCallback(req, res) {
  res.status(202).json({ message: 'OAuth callback received', payload: req.body });
}

module.exports = {
  register,
  login,
  refreshToken,
  listProviders,
  oauthCallback
};
