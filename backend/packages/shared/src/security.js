const crypto = require('crypto');
const logger = require('./logger');

const DEFAULT_KEY = process.env.DATA_ENCRYPTION_KEY || crypto.randomBytes(32).toString('base64');

function getKey() {
  const buffer = Buffer.from(DEFAULT_KEY, 'base64');
  if (buffer.length !== 32) {
    logger.warn('Invalid DATA_ENCRYPTION_KEY length, generating ephemeral key');
    return crypto.createHash('sha256').update(DEFAULT_KEY).digest();
  }
  return buffer;
}

function encryptData(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decryptData(payload) {
  if (!payload) {
    return null;
  }
  const data = Buffer.from(payload, 'base64');
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const text = data.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);
  try {
    return JSON.parse(decrypted.toString('utf8'));
  } catch (error) {
    logger.error('Failed to decrypt data', { error: error.message });
    return null;
  }
}

function hashSensitive(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = {
  encryptData,
  decryptData,
  hashSensitive
};
