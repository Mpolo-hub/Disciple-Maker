const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: process.env.SERVICE_NAME || 'shared' },
  transports: [
    new transports.Console()
  ]
});

module.exports = logger;
