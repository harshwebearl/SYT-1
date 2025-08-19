const { addCustomer, updateCustomer, deleteCustomer, getCustomerById, getAllCustomer } = require('../controllers/customer_details_controller');
const adminUserAuth = require('../middleware/admin-user-auth');
const upload = require('../middleware/multerSetUp');

const router = require('express').Router();

router.post('/addCustomer', adminUserAuth, upload.single('customerPhoto'), addCustomer);
router.put('/updateCustomer/:id', adminUserAuth, upload.single('customerPhoto'), updateCustomer);
router.delete('/deleteCustomer/:id', adminUserAuth, deleteCustomer);
router.get('/getCustomerById/:id', adminUserAuth, getCustomerById);
router.get('/getAllCustomer', adminUserAuth, getAllCustomer)

module.exports = router;
