const rateLimit = require('express-rate-limit');
const { verifyAccessToken, logger } = require('@employee-health/shared');

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});

function authenticate(optional = false) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
      if (optional) {
        return next();
      }
      return res.status(401).json({ message: 'Authorization header missing' });
    }
    const token = header.replace('Bearer ', '');
    const payload = verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = payload;
    return next();
  };
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', { userId: req.user.sub, roles });
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}

module.exports = {
  authenticate,
  requireRole,
  limiter
};
