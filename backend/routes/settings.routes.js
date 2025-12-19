const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Public read (but require login)
router.get('/:key', authenticate, settingsController.getSetting);

// Admin only write
router.post('/:key', authenticate, authorize('ADMIN'), settingsController.updateSetting);

module.exports = router;
