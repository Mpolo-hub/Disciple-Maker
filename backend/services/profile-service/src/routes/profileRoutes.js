const { Router } = require('express');
const controller = require('../controllers/profileController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.get('/profiles', controller.listProfiles);
router.post('/profiles', controller.upsertProfile);
router.get('/profiles/:id', controller.getProfile);
router.patch('/profiles/:id', controller.updateProfile);
router.post('/profiles/:id/documents', upload.single('document'), controller.uploadDocument);
router.get('/profiles/:id/documents', controller.listDocuments);

module.exports = router;
