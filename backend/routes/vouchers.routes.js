const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/vouchers.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

// Everyone can create, read. Only ADMIN/ACCOUNTANT can update? Or just ADMIN?
// Let's say everyone can create.
router.get('/', voucherController.getVouchers);
router.post('/', authorize([], 'create_voucher'), voucherController.createVoucher);

// Update/Delete restricted
router.put('/:id', authorize([], 'edit_voucher'), voucherController.updateVoucher);
router.delete('/:id', authorize([], 'delete_voucher'), voucherController.deleteVoucher);

module.exports = router;
