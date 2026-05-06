const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { auth } = require('../middleware/auth');

router.get('/', auth, wishlistController.getWishlist);
router.post('/add', auth, wishlistController.addToWishlist);
router.post('/remove', auth, wishlistController.removeFromWishlist);
router.post('/move-to-cart', auth, wishlistController.moveToCart);
router.post('/move-to-wishlist', auth, wishlistController.moveToWishlist);

module.exports = router;
