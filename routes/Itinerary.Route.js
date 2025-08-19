const express = require("express");
const router = express.Router();
const ItineraryController = require("../controllers/Itinerary.Controller");
const iteineraryController = new ItineraryController();

const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");
//add itinerary
// router.post(
//   "/",
//   adminUserAuth,
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "single",
//     "photo",
//     // [
//     //   { name: "pancard_image", maxCount: 1 },
//     //   { name: "agency_logo", maxCount: 1 },
//     // ],
//     "uploads/images/itinerary" // ""
//   ),
//   (req, res) => iteineraryController.addItinerary(req, res)
// );
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/itinary"); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, (Date.now() + file.originalname).replace(/\s+/g, "")); // Set a unique filename for the uploaded file
  }
});

// Set the upload limits for files
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload a valid image file"));
    }
    cb(null, true);
  }
});
// const cp = upload.fields([{ name: "photo", maxCount: 1 }]);
router.post("/", adminUserAuth, upload.single('photo'), (req, res) => iteineraryController.addItinerary(req, res));

//display package itinerary
router.get("/", adminUserAuth, (req, res) => iteineraryController.getPackageItinerary(req, res));

//display package itinerary by id
router.get("/byid", adminUserAuth, (req, res) => iteineraryController.getPackageItineraryById(req, res));

//update itinerary
router.put("/", adminUserAuth, upload.single('photo'), (req, res) => iteineraryController.updateItinerary(req, res));

router.put("/biditinerary", adminUserAuth, upload.single('photo'), (req, res) => iteineraryController.update_bid_itinerary(req, res));

//delete itinerary
router.delete("/", adminUserAuth, (req, res) => iteineraryController.deleteItinerary(req, res));

router.delete("/biditinerary", adminUserAuth, (req, res) => iteineraryController.delete_bid_itinerary(req, res));

//add itinerary of Bid packages
router.post("/addBid", adminUserAuth, upload.single('photo'), (req, res) => iteineraryController.addBidItinerary(req, res));

router.get("/hotel_find", (req, res) => iteineraryController.hotel_itinerary_find_all(req, res))

module.exports = router;
