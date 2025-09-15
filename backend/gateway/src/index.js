const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const registerRoutes = require('./routes/proxy');
const { logger } = require('@employee-health/shared');
const { limiter } = require('./middleware/auth');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(limiter);
app.use(morgan('combined'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

registerRoutes(app);

app.use((err, req, res, next) => {
  logger.error('Gateway error', { error: err.message, stack: err.stack });
  res.status(500).json({ message: 'Internal gateway error' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  logger.info(`API Gateway listening on ${port}`);
});
