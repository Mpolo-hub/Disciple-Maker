const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const profileRoutes = require('./routes/profileRoutes');
const { logger } = require('@employee-health/shared');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'profile-service' });
});

app.use('/', profileRoutes);

app.use((err, req, res, next) => {
  logger.error('Profile service error', { error: err.message });
  res.status(err.status || 500).json({ message: err.message || 'Internal error' });
});

const port = process.env.PORT || 4002;
app.listen(port, () => logger.info(`Profile service listening on ${port}`));
