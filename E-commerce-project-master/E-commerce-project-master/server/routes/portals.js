const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portalController');
const { auth } = require('../middleware/auth');

router.post('/', auth, portalController.createPortal);
router.get('/my', auth, portalController.getMyPortals);
router.get('/url/:url', portalController.getPortalByUrl);
router.put('/:id', auth, portalController.updatePortal);
router.delete('/:id', auth, portalController.deletePortal);

module.exports = router;
