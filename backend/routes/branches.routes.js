const express = require('express');
const router = express.Router();
const branchesController = require('../controllers/branches.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate);

// Only ADMIN or manage_branches permission can manage
router.get('/', branchesController.getBranches);
router.post('/', authorize([], 'manage_branches'), branchesController.createBranch);
router.delete('/:id', authorize([], 'manage_branches'), branchesController.deleteBranch);

module.exports = router;
