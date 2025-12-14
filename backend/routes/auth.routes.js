const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/register', authenticate, authorize(['ADMIN']), authController.register);

module.exports = router;
