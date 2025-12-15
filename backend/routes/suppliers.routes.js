const express = require('express');
const router = express.Router();
const suppliersController = require('../controllers/suppliers.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

router.get('/', suppliersController.getSuppliers);
router.post('/', authorize([], 'manage_suppliers'), suppliersController.createSupplier);
router.put('/:id', authorize([], 'manage_suppliers'), suppliersController.updateSupplier);
router.delete('/:id', authorize([], 'manage_suppliers'), suppliersController.deleteSupplier);

module.exports = router;
