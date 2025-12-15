const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

// Reports only for Admin/Accountant usually
router.get('/audit-logs', authorize([], 'view_reports'), reportsController.getAuditLogs);
router.get('/summary', authorize([], 'view_reports'), reportsController.getSummaryReport);

module.exports = router;
