const express = require("express");
const router = express.Router();
const cms_visa_booking_Controller = require("../controllers/cms_visa_booking.Controller");
const cms_visa_booking_controller = new cms_visa_booking_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const multer = require("multer");
const path = require("path");

// router.post(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "single",
//     "file_photo_path",
//     // [
//     //   { name: "pancard_image", maxCount: 1 },
//     //   { name: "agency_logo", maxCount: 1 },
//     // ],
//     "uploads/images/cms_visa_booking" // ""
//   ),
//   adminUserAuth,
//   (req, res) => cms_visa_booking_controller.add_cms_visa_booking(req, res)
// );
router.post(
  "/",
  (req, res, next) => {
    // Set the destination path in the multerMiddleware module
    multerMiddleware.setDestinationPath("public/images/cms_visa_booking");

    // Use the multerMiddleware.upload middleware for handling file uploads
    multerMiddleware.upload.fields([
      { name: "pancard_image", maxCount: 1 },
      { name: "agency_logo", maxCount: 1 }
    ])(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Handle Multer errors
        return res.status(400).json({ error: err.message });
      } else if (err) {
        // Handle other errors
        return res.status(500).json({ error: err.message });
      }

      // Files uploaded successfully
      // Access the uploaded files using req.files

      // Example response
      // res.json({ message: 'Files uploaded successfully' });
    });
    next();
  },
  adminUserAuth,
  (req, res) => cms_visa_booking_controller.add_cms_visa_booking(req, res)
);

router.get("/", adminUserAuth, (req, res) => cms_visa_booking_controller.display_cms_visa_booking(req, res));

router.get("/all", adminUserAuth, (req, res) => cms_visa_booking_controller.display_all_cms_visa_booking(req, res));

router.put(
  "/",
  uploadFile(
    process?.env?.ACTIVE_STORAGE,
    "single",
    "file_photo_path",
    // [
    //   { name: "pancard_image", maxCount: 1 },
    //   { name: "agency_logo", maxCount: 1 },
    // ],
    "uploads/images/cms_visa_booking" // ""
  ),
  adminUserAuth,
  (req, res) => cms_visa_booking_controller.update_cms_visa_booking(req, res)
);

router.delete("/delete", adminUserAuth, (req, res) => cms_visa_booking_controller.delete_cms_visa_booking(req, res));

module.exports = router;
