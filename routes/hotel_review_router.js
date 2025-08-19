const express = require("express");
const router = express.Router();
const hotel_booking_review_controller = require("../controllers/hotel_review_by_user_controller");
const Hotel_booking_review_controller = new hotel_booking_review_controller();



router.post("/add_review", (req, res) => Hotel_booking_review_controller.add_hotel_review(req, res));

router.get("/display_review", (req, res) => Hotel_booking_review_controller.Display_review(req, res));

router.put("/updatereview", (req, res) => Hotel_booking_review_controller.updatereview(req, res));


router.put("/deleteReview", (req, res) => Hotel_booking_review_controller.delete_hotel_review(req, res));

router.get("/display_review_by_admin_agency", (req, res) => Hotel_booking_review_controller.Display_review_by_admin_and_agency(req, res))



module.exports = router