const express = require('express');
const router = express.Router();
const mlmController = require('../controllers/mlmController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/tree', mlmController.getTreeVisualization);
router.get('/hierarchy/:userId?', auth, mlmController.getHierarchy);
router.get('/franchise/:side', auth, mlmController.getFranchise);
router.get('/next-parent', mlmController.getNextParentInfo);
router.get('/user/:userId', mlmController.getUserById);
router.post('/consolidation', auth, requireRole('founder'), mlmController.monthlyConsolidation);

module.exports = router;
