const express = require("express");
const router = express.Router();
const hotel_booking_Controller = require("../controllers/hotel_booking.Controller");
const hotel_booking_controller = new hotel_booking_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => hotel_booking_controller.add_hotel_booking(req, res));

router.get("/all", adminUserAuth, (req, res) => hotel_booking_controller.display_all_hotel_booking(req, res));

router.get("/", adminUserAuth, (req, res) => hotel_booking_controller.display_hotel_booking(req, res));

router.put("/", adminUserAuth, (req, res) => hotel_booking_controller.update_hotel_booking(req, res));

router.delete("/delete", adminUserAuth, (req, res) => hotel_booking_controller.delete_hotel_booking(req, res));

module.exports = router;
