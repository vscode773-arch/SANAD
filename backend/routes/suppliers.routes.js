const express = require('express');
const router = express.Router();
const suppliersController = require('../controllers/suppliers.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', suppliersController.getSuppliers);
router.post('/', authorize(['ADMIN', 'ACCOUNTANT']), suppliersController.createSupplier);
router.put('/:id', authorize(['ADMIN', 'ACCOUNTANT']), suppliersController.updateSupplier);
router.delete('/:id', authorize(['ADMIN']), suppliersController.deleteSupplier);

module.exports = router;
