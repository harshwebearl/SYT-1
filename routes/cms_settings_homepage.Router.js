const express = require("express");
const router = express.Router();
const cms_settings_homepage_Controller = require("../controllers/cms_settings_homepage.Controller");
const cms_settings_homepage_controller = new cms_settings_homepage_Controller();
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
//       { name: "favicon_img", maxCount: 1 },
//       { name: "logo_img", maxCount: 1 },
//       { name: "testimonial_banner_img", maxCount: 1 },
//       { name: "testimonial_background_img", maxCount: 1 }
//     ],
//     "uploads/images/cms_settings_homepage" // ""
//   ),
//   adminUserAuth,
//   (req, res) => cms_settings_homepage_controller.add_cms_settings_homepage(req, res)
// );
router.post(
  "/",
  (req, res, next) => {
    // Set the destination path in the multerMiddleware module
    multerMiddleware.setDestinationPath("public/images/cms_settings");

    // Use the multerMiddleware.upload middleware for handling file uploads
    multerMiddleware.upload.fields([
      { name: "favicon_img", maxCount: 1 },
      { name: "logo_img", maxCount: 1 },
      { name: "testimonial_banner_img", maxCount: 1 },
      { name: "testimonial_background_img", maxCount: 1 }
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
  (req, res) => cms_settings_homepage_controller.add_cms_settings_homepage(req, res)
);

router.get("/", adminUserAuth, (req, res) => cms_settings_homepage_controller.display_cms_settings_homepage(req, res));

router.get("/all", adminUserAuth, (req, res) =>
  cms_settings_homepage_controller.display_all_cms_settings_homepage(req, res)
);

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "favicon_img", maxCount: 1 },
//       { name: "logo_img", maxCount: 1 },
//       { name: "testimonial_banner_img", maxCount: 1 },
//       { name: "testimonial_background_img", maxCount: 1 }
//     ],
//     "uploads/images/cms_settings_homepage" // ""
//   ),
//   adminUserAuth,
//   (req, res) => cms_settings_homepage_controller.update_cms_settings_homepage(req, res)
// );
router.put(
  "/",
  (req, res, next) => {
    // Set the destination path in the multerMiddleware module
    multerMiddleware.setDestinationPath("public/images/cms_settings");

    // Use the multerMiddleware.upload middleware for handling file uploads
    multerMiddleware.upload.fields([
      { name: "favicon_img", maxCount: 1 },
      { name: "logo_img", maxCount: 1 },
      { name: "testimonial_banner_img", maxCount: 1 },
      { name: "testimonial_background_img", maxCount: 1 }
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
  (req, res) => cms_settings_homepage_controller.update_cms_settings_homepage(req, res)
);

router.delete("/delete", adminUserAuth, (req, res) =>
  cms_settings_homepage_controller.delete_cms_settings_homepage(req, res)
);

module.exports = router;
