const express = require('express');
const router = express.Router();
const packageProfitMarginController = require('../controllers/package_profit_margin_controller');
const adminUserAuth = require('../middleware/admin-user-auth');

// Create
router.post('/create', adminUserAuth, packageProfitMarginController.create);

// Get All
router.get('/all', adminUserAuth, packageProfitMarginController.getAll);

router.get('/getById/:id', adminUserAuth, packageProfitMarginController.getById);

// Update
router.put('/update/:id', adminUserAuth, packageProfitMarginController.update);

// Delete
router.delete('/delete/:id', adminUserAuth, packageProfitMarginController.delete);

module.exports = router;
