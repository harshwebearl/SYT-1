const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const ReviewController = new reviewController();

const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");

router.post("/", (req, res) => ReviewController.Addreview(req, res));

router.get("/", (req, res) => ReviewController.Display_review(req, res));

router.put("/updatereview", (req, res) => ReviewController.updatereview(req, res));

router.get("/agencyallreview", (req, res) => ReviewController.display_agencys_all_review(req, res));

router.get("/allreview", (req, res) => ReviewController.display_agencys_all_review_agency(req, res));

router.get("/displayAdminReview", (req, res) => ReviewController.display_admin_review(req, res));

router.get("/displayAllReview", (req, res) => ReviewController.display_all_reviews(req, res));

module.exports = router;
