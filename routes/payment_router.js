const router = require("express").Router();
const trasaction_controller = require("../controllers/paymentController");
const adminUserAuth = require("../middleware/admin-user-auth");



router.post("/pay", trasaction_controller.initiate_payment);
router.get("/payment_status", trasaction_controller.getPaymentStatus);
router.put("/update/:id", adminUserAuth, trasaction_controller.updatePayment)
router.put("/updateBooking/:id", adminUserAuth, trasaction_controller.updateBookingData)

router.put("/updateHotelBooking/:id", adminUserAuth, trasaction_controller.updateHotelBooking)

router.put("/updateCarBooking/:id", adminUserAuth, trasaction_controller.updateCarBooking)

module.exports = router