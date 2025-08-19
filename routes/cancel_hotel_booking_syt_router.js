const express = require("express");
const router = express.Router();
const cancel_hotel_booking_syt_Controller = require("../controllers/cancel_hotel_booking_syt_controller");
const multer = require("multer");
// const auth = require("../middleware/auth");
const cancel_hotel_booking_syt_controller = new cancel_hotel_booking_syt_Controller();

router.post("/", (req, res) => cancel_hotel_booking_syt_controller.user_cancle_booked_hotel(req, res));

module.exports = router;
