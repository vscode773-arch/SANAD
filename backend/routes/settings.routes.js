const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { protect, admin } = require('../middlewares/auth.middleware');

// Public read (or protected if preferred, but public is fine for UI state)
router.get('/:key', protect, settingsController.getSetting);

// Admin only write
router.post('/:key', protect, admin, settingsController.updateSetting);

module.exports = router;
