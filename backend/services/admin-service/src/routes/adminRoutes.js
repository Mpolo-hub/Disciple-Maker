const { Router } = require('express');
const controller = require('../controllers/adminController');

const router = Router();

router.get('/admin/metrics', controller.getMetrics);
router.get('/admin/audit', controller.listAuditLogs);
router.get('/admin/incidents', controller.listIncidents);

module.exports = router;
