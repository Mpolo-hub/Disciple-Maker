const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const { logger } = require('@employee-health/shared');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use(morgan('combined'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

app.use('/', authRoutes);

app.use((err, req, res, next) => {
  logger.error('Auth service error', { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({ message: err.message || 'Internal error' });
});

const port = process.env.PORT || 4001;
app.listen(port, () => {
  logger.info(`Auth service listening on ${port}`);
});
