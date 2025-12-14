const express = require('express');
const router = express.Router();
const branchesController = require('../controllers/branches.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

// Only ADMIN can manage branches
router.get('/', branchesController.getBranches); // Users might need to see branches? Maybe restrict manage to admin.
router.post('/', authorize(['ADMIN']), branchesController.createBranch);
router.delete('/:id', authorize(['ADMIN']), branchesController.deleteBranch);

module.exports = router;
