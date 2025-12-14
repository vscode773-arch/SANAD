const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/vouchers.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', voucherController.getVouchers);
router.post('/', authorize(['ADMIN', 'ACCOUNTANT']), voucherController.createVoucher);
router.put('/:id', authorize(['ADMIN', 'ACCOUNTANT']), voucherController.updateVoucher);
router.delete('/:id', authorize(['ADMIN']), voucherController.deleteVoucher);

module.exports = router;
