const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');
const { authenticate, requireRole } = require('../middleware/auth');

module.exports = function registerRoutes(app) {
  app.use('/v1/auth', createProxyMiddleware({ target: services.auth, changeOrigin: true, pathRewrite: { '^/v1/auth': '' } }));

  app.use('/v1/profiles', authenticate(), createProxyMiddleware({
    target: services.profile,
    changeOrigin: true,
    pathRewrite: { '^/v1/profiles': '' }
  }));

  app.use('/v1/symptom-checker', authenticate(), createProxyMiddleware({
    target: services.triage,
    changeOrigin: true,
    pathRewrite: { '^/v1/symptom-checker': '' }
  }));

  app.use('/v1/appointments', authenticate(), createProxyMiddleware({
    target: services.appointments,
    changeOrigin: true,
    pathRewrite: { '^/v1/appointments': '' }
  }));

  app.use('/v1/emergency', authenticate(), createProxyMiddleware({
    target: services.emergency,
    changeOrigin: true,
    pathRewrite: { '^/v1/emergency': '' }
  }));

  app.use('/v1/admin', authenticate(), requireRole('admin', 'medical_staff'), createProxyMiddleware({
    target: services.admin,
    changeOrigin: true,
    pathRewrite: { '^/v1/admin': '' }
  }));
};
