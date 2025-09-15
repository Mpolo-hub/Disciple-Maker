const { Router } = require('express');
const controller = require('../controllers/appointmentController');

const router = Router();

router.get('/appointments', controller.listAppointments);
router.post('/appointments', controller.createAppointment);
router.patch('/appointments/:id', controller.updateAppointment);
router.get('/availability', controller.getAvailability);

module.exports = router;
