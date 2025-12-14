const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/vouchers.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

// Everyone can create, read. Only ADMIN/ACCOUNTANT can update? Or just ADMIN?
// Let's say everyone can create.
router.get('/', voucherController.getVouchers);
router.post('/', voucherController.createVoucher);

// Update/Delete restricted
router.put('/:id', authorize(['ADMIN', 'ACCOUNTANT']), voucherController.updateVoucher);
router.delete('/:id', authorize(['ADMIN']), voucherController.deleteVoucher);

module.exports = router;
