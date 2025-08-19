const express = require("express");
const router = express.Router();
const HotelBookSytController = require("../controllers/hotel_book_syt_controller");

// Create controller instance
const hotelBookSytController = new HotelBookSytController();

/* ===========================
   📌 USER ROUTES
=========================== */
// Book a hotel
router.post("/book", hotelBookSytController.userBookedHotel);

// Get user's booked hotels
router.get("/bookings", hotelBookSytController.userDisplayBookedHotel);

// Cancel hotel booking
router.put(
  "/bookings/:hotel_booked_id/cancel",
  hotelBookSytController.hotelStatusCancelByUser
);

/* ===========================
   📌 AGENCY ROUTES
=========================== */
// Get all hotel bookings for agency
router.get(
  "/agency/bookings",
  hotelBookSytController.agencyDisplayAllBookedHotel
);

/* ===========================
   📌 ADMIN ROUTES
=========================== */
// Get all hotel bookings
router.get(
  "/admin/bookings",
  hotelBookSytController.adminDisplayAllBookedHotel
);

// Get specific booking details
router.get(
  "/admin/bookings/:_id",
  hotelBookSytController.adminDisplayDetailsBookedHotel
);

// Update booking status
router.put(
  "/admin/bookings/:hotel_booked_id/status",
  hotelBookSytController.hotelStatusChangeApi
);

module.exports = router;
