const express = require("express");
const router = express.Router();
const book_package_itinerary_Controller = require("../controllers/book_package_itinerary.controller");
const book_package_itinerary_controller = new book_package_itinerary_Controller();
const adminUserAuth = require("../middleware/admin-user-auth");

const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");

// Add BookPackageItinerary
router.post("/", adminUserAuth, (req, res) => book_package_itinerary_controller.add_book_package_itinerary(req, res));

// Get BookPackageItinerary
router.get("/", adminUserAuth, (req, res) =>
  book_package_itinerary_controller.display_book_package_itinerary(req, res)
);

module.exports = router;
