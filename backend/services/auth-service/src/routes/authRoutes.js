const { Router } = require('express');
const controller = require('../controllers/authController');

const router = Router();

router.post('/auth/register', controller.register);
router.post('/auth/login', controller.login);
router.post('/auth/refresh', controller.refreshToken);
router.get('/auth/providers', controller.listProviders);
router.post('/auth/oauth/callback', controller.oauthCallback);

module.exports = router;
