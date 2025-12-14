const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Generate Backup - Admin Only
router.get('/backup', authenticate, authorize(['ADMIN']), maintenanceController.downloadBackup);

// Restore Backup - Admin Only
router.post('/restore', authenticate, authorize(['ADMIN']), upload.single('backupFile'), maintenanceController.restoreBackup);

module.exports = router;
