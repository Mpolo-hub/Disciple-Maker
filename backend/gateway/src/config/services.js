module.exports = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  profile: process.env.PROFILE_SERVICE_URL || 'http://localhost:4002',
  triage: process.env.TRIAGE_SERVICE_URL || 'http://localhost:4003',
  appointments: process.env.APPOINTMENTS_SERVICE_URL || 'http://localhost:4004',
  emergency: process.env.EMERGENCY_SERVICE_URL || 'http://localhost:4005',
  admin: process.env.ADMIN_SERVICE_URL || 'http://localhost:4006'
};
