const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { auth, requireRole, teamMemberAuth } = require('../middleware/auth');

// Store details
router.get('/store', auth, requireRole('brand_owner'), businessController.getStoreDetails);
router.put('/store', auth, requireRole('brand_owner'), businessController.updateStoreDetails);

// Overview / financial data
router.get('/overview', auth, requireRole('brand_owner'), businessController.getOverview);

// Categories
router.get('/categories', auth, requireRole('brand_owner'), businessController.getCategories);
router.post('/categories', auth, requireRole('brand_owner'), businessController.createCategory);
router.put('/categories/:id', auth, requireRole('brand_owner'), businessController.updateCategory);
router.delete('/categories/:id', auth, requireRole('brand_owner'), businessController.deleteCategory);

// Team member login (public — no auth required, MUST be before /team/:id routes)
router.post('/team/login', businessController.teamMemberLogin);

// Team member product operations (team member auth, MUST be before /team/:id routes)
router.get('/team/products', teamMemberAuth, businessController.teamMemberGetProducts);
router.post('/team/products', teamMemberAuth, businessController.teamMemberAddProduct);
router.put('/team/products/:id', teamMemberAuth, businessController.teamMemberEditProduct);

// Team members (brand owner manages team)
router.get('/team', auth, requireRole('brand_owner'), businessController.getTeamMembers);
router.post('/team', auth, requireRole('brand_owner'), businessController.createTeamMember);
router.put('/team/:id', auth, requireRole('brand_owner'), businessController.updateTeamMember);
router.delete('/team/:id', auth, requireRole('brand_owner'), businessController.deleteTeamMember);

// Inventory (admin-level aggregate)
router.get('/inventory/all', auth, businessController.getInventoryAll);
router.post('/inventory/update-stock', auth, businessController.updateStock);
router.post('/inventory/sync-all', auth, businessController.syncAll);
router.get('/inventory/export', auth, businessController.exportInventory);

module.exports = router;