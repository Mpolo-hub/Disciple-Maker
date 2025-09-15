const { Router } = require('express');
const controller = require('../controllers/emergencyController');

const router = Router();

router.post('/emergency/alerts', controller.triggerAlert);
router.post('/emergency/alerts/:id/acknowledge', controller.acknowledgeAlert);
router.get('/emergency/alerts', controller.listAlerts);

module.exports = router;
