const mognoose = require("mongoose");
const router = require("express").Router();
const car_booking_Controller = require("../controllers/car_booking_syt_controller");
const adminUserAuth = require("../middleware/admin-user-auth");

const car_booking_controller = new car_booking_Controller();




router.post("/car_booking", adminUserAuth, car_booking_controller.newCarBooking);
router.get("/displayUserBookedCar", adminUserAuth, car_booking_controller.displayUserBookedCar);
router.get("/displayDetails", adminUserAuth, car_booking_controller.displayUserBookedCarDetails)
router.get("/vendorBookedCar", adminUserAuth, car_booking_controller.displayVendorBookedCar);
router.get("/vendorBookedCarDetails", adminUserAuth, car_booking_controller.displayVendorBookedCarById)
router.put("/updateStatus", adminUserAuth, (req, res) => car_booking_controller.update_car_booking(req, res));
router.get("/vendorBookedCarByAdmin", adminUserAuth, car_booking_controller.displayVendorBookedCarByAdmin);
router.get("/displayUserBookedCarByAdmin", adminUserAuth, car_booking_controller.displayUserBookedCarByAdmin);


module.exports = router