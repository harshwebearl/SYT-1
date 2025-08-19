const express = require("express");
const router = express.Router();
const cms_aboutus_Controller = require("../controllers/cms_aboutus.Controller");
const cms_aboutus_controller = new cms_aboutus_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const path = require("path");
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");

// router.post(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "banner_img", maxCount: 1 },
//       { name: "partner_images", maxCount: 4 }
//     ],
//     "uploads/images/cms_aboutus" // ""
//   ),
//   adminUserAuth,
//   (req, res) => cms_aboutus_controller.add_cms_aboutus(req, res)
// );
router.post(
  "/",
  (req, res, next) => {
    // Set the destination path in the multerMiddleware module
    multerMiddleware.setDestinationPath("public/images/cms_aboutus");

    // Use the multerMiddleware.upload middleware for handling file uploads
    multerMiddleware.upload.fields([
      { name: "banner_img", maxCount: 1 },
      { name: "partner_images", maxCount: 4 }
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
  (req, res) => cms_aboutus_controller.add_cms_aboutus(req, res)
);

router.get("/", adminUserAuth, (req, res) => cms_aboutus_controller.display_cms_aboutus(req, res));

router.get("/all", adminUserAuth, (req, res) => cms_aboutus_controller.display_all_cms_aboutus(req, res));

// router.put(
//   "/",
//   adminUserAuth,
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "banner_img", maxCount: 1 },
//       { name: "partner_images", maxCount: 4 }
//     ],
//     "uploads/images/cms_aboutus" // ""
//   ),
//   (req, res) => cms_aboutus_controller.update_cms_aboutus(req, res)
// );

router.put(
  "/",
  adminUserAuth,
  (req, res, next) => {
    // Set the destination path in the multerMiddleware module
    multerMiddleware.setDestinationPath("public/images/cms_aboutus");

    // Use the multerMiddleware.upload middleware for handling file uploads
    multerMiddleware.upload.fields([
      { name: "banner_img", maxCount: 1 },
      { name: "partner_images", maxCount: 4 }
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
  (req, res) => cms_aboutus_controller.update_cms_aboutus(req, res)
);

router.delete("/delete", adminUserAuth, (req, res) => cms_aboutus_controller.delete_cms_aboutus(req, res));

module.exports = router;
