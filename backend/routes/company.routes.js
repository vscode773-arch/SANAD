const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['ADMIN']));

// Get company settings
router.get('/', companyController.getCompanySettings);

// Update company name
router.put('/', companyController.updateCompanySettings);

// Upload company logo
router.post('/logo', companyController.uploadLogo);

// Delete company logo
router.delete('/logo', companyController.deleteLogo);

module.exports = router;
