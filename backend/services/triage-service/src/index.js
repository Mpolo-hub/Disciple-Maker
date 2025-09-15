const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const triageRoutes = require('./routes/triageRoutes');
const { logger } = require('@employee-health/shared');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'triage-service' }));
app.use('/', triageRoutes);

app.use((err, req, res, next) => {
  logger.error('Triage service error', { error: err.message });
  res.status(err.status || 500).json({ message: err.message || 'Internal error' });
});

const port = process.env.PORT || 4003;
app.listen(port, () => logger.info(`Triage service listening on ${port}`));
