const adminService = require('../services/adminService');

async function getMetrics(req, res, next) {
  try {
    const metrics = await adminService.getMetrics(req.query.since);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
}

async function listAuditLogs(req, res, next) {
  try {
    const logs = await adminService.listAuditLogs({ userId: req.query.userId });
    res.json(logs);
  } catch (error) {
    next(error);
  }
}

async function listIncidents(req, res, next) {
  try {
    const incidents = await adminService.listIncidents();
    res.json(incidents);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMetrics,
  listAuditLogs,
  listIncidents
};
