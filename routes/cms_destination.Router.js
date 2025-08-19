const express = require("express");
const router = express.Router();
const cms_destination_Controller = require("../controllers/cms_destination.Controller");
const cms_destination_controller = new cms_destination_Controller();
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
//     "fields",
//     [
//       { name: "image", maxCount: 1 },
//       { name: "banners_img", maxCount: 10 }
//     ],
//     "uploads/images/room" // ""
//   ),
router.post(
  "/",
  (req, res, next) => {
    // Set the destination path in the multerMiddleware module
    multerMiddleware.setDestinationPath("public/images/cms_destination");

    // Use the multerMiddleware.upload middleware for handling file uploads
    multerMiddleware.upload.fields([
      { name: "img", maxCount: 1 }
      //       { name: "banners_img", maxCount: 10 }
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
      // res.json({ message: "Files uploaded successfully" });
    });
    next();
  },
  adminUserAuth,
  (req, res) => cms_destination_controller.add_cms_destination(req, res)
);

router.get("/", adminUserAuth, (req, res) => cms_destination_controller.display_cms_destination(req, res));

router.get("/all", adminUserAuth, (req, res) => cms_destination_controller.display_all_cms_destination(req, res));

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "image", maxCount: 1 },
//       { name: "banners_img", maxCount: 10 }
//     ],
//     "uploads/images/room" // ""
//   ),
//   adminUserAuth,
//   (req, res) => cms_destination_controller.update_cms_destination(req, res)
// );

router.put(
  "/",
  (req, res, next) => {
    // Set the destination path in the multerMiddleware module
    multerMiddleware.setDestinationPath("public/images/cms_destination");

    // Use the multerMiddleware.upload middleware for handling file uploads
    multerMiddleware.upload.fields([
      { name: "img", maxCount: 1 }
      //       { name: "banners_img", maxCount: 10 }
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
      // res.json({ message: "Files uploaded successfully" });
    });
    next();
  },
  adminUserAuth,
  (req, res) => cms_destination_controller.update_cms_destination(req, res)
);
router.delete("/delete", adminUserAuth, (req, res) => cms_destination_controller.delete_cms_destination(req, res));

module.exports = router;
