const { addLead, deleteLead, getAllLead, updateLead, getDetailsLead } = require('../controllers/lead_controller');

const router = require('express').Router();

const adminUserAuth = require("../middleware/admin-user-auth");


router.post('/addLead', adminUserAuth, addLead);
router.delete('/deleteLead/:id', adminUserAuth, deleteLead);
router.get('/getAllLead', adminUserAuth, getAllLead);
router.get('/detailsLead', adminUserAuth, getDetailsLead);
router.put('/updateLead/:id', adminUserAuth, updateLead);

module.exports = router;