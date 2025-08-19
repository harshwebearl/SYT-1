const express = require("express");
const router = express.Router();
const flight_booking_Controller = require("../controllers/flight_booking.Controller");
const flight_booking_controller = new flight_booking_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const multer = require("multer");
const path = require("path");
const multerMiddleware = require("../middleware/sytmulter.js");
// router.post(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "single",
//     "airlines_img",
//     // [
//     //   { name: "pancard_image", maxCount: 1 },
//     //   { name: "agency_logo", maxCount: 1 },
//     // ],
//     "uploads/images/flight_booking" // ""
//   ),
//   adminUserAuth,
//   (req, res) => flight_booking_controller.add_flight_booking(req, res)
// );
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/flight_booking"); // Set the destination folder for uploaded files
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
const cp = upload.fields([{ name: "airlines_img", maxCount: 1 }]);
router.post("/", cp, adminUserAuth, (req, res) => flight_booking_controller.add_flight_booking(req, res));

router.get("/", adminUserAuth, (req, res) => flight_booking_controller.display_flight_booking(req, res));

router.get("/all", adminUserAuth, (req, res) => flight_booking_controller.display_all_flight_booking(req, res));

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "single",
//     "airlines_img",

//     "uploads/images/flight_booking" // ""
//   ),
//   adminUserAuth,
//   (req, res) => flight_booking_controller.update_flight_booking(req, res)
// );

router.put("/", cp, adminUserAuth, (req, res) => flight_booking_controller.update_flight_booking(req, res));

router.delete("/delete", adminUserAuth, (req, res) => flight_booking_controller.delete_flight_booking(req, res));

module.exports = router;
