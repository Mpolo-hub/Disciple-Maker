require('dotenv').config();

const logger = require('./logger');
const security = require('./security');
const tokens = require('./tokens');
const database = require('./database');
const audit = require('./audit');

module.exports = {
  logger,
  ...security,
  ...tokens,
  ...database,
  ...audit
};
