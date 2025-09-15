const { Router } = require('express');
const controller = require('../controllers/triageController');

const router = Router();

router.get('/symptom-checker/protocols', controller.getProtocols);
router.post('/symptom-checker/sessions', controller.startSession);
router.post('/symptom-checker/sessions/:id/responses', controller.submitResponse);
router.get('/symptom-checker/sessions/:id', controller.getSession);

module.exports = router;
