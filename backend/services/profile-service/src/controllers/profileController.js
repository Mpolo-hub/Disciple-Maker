const Joi = require('joi');
const profileService = require('../services/profileService');

const profileSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  bloodType: Joi.string().allow(null, ''),
  heightCm: Joi.number().positive().allow(null),
  weightKg: Joi.number().positive().allow(null),
  chronicConditions: Joi.array().items(Joi.string()),
  lifestyle: Joi.object(),
  allergies: Joi.array().items(Joi.object({
    substance: Joi.string().required(),
    reaction: Joi.string().allow(''),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('low')
  })),
  medications: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    dosage: Joi.string().allow(''),
    prescribedBy: Joi.string().allow(''),
    startDate: Joi.date().allow(null),
    endDate: Joi.date().allow(null)
  })),
  emergencyContacts: Joi.array().items(Joi.object({
    fullName: Joi.string().required(),
    relation: Joi.string().allow(''),
    phoneNumber: Joi.string().required(),
    email: Joi.string().email().allow('')
  }))
});

async function listProfiles(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    const profiles = await profileService.listProfiles(userId);
    res.json(profiles);
  } catch (error) {
    next(error);
  }
}

async function getProfile(req, res, next) {
  try {
    const profile = await profileService.getProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function upsertProfile(req, res, next) {
  try {
    const payload = await profileSchema.validateAsync(req.body, { stripUnknown: true });
    const profile = await profileService.upsertProfile(payload);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const payload = await profileSchema.validateAsync({ ...req.body, userId: req.body.userId || req.params.id }, { stripUnknown: true, allowUnknown: true });
    const profile = await profileService.updateProfile(req.params.id, payload);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function uploadDocument(req, res, next) {
  try {
    const document = await profileService.storeDocument(req.params.id, req.file);
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
}

async function listDocuments(req, res, next) {
  try {
    const documents = await profileService.listDocuments(req.params.id);
    res.json(documents);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listProfiles,
  getProfile,
  upsertProfile,
  updateProfile,
  uploadDocument,
  listDocuments
};
