const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');

// CRUD Routes
router.post('/create', inquiryController.createInquiry); // Create an inquiry
router.get('/getAll', inquiryController.getAllInquiries); // Get all inquiries
router.get('/getById/:id', inquiryController.getInquiryById); // Get a single inquiry by ID
router.put('/update/:id', inquiryController.updateInquiry); // Update an inquiry by ID
router.delete('/delete/:id', inquiryController.deleteInquiry); // Delete an inquiry by ID

module.exports = router;
