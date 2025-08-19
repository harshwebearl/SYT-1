const express = require("express");
const router = express.Router();
const cms_testimonials_Controller = require("../controllers/cms_testimonials.Controller");
const cms_testimonials_controller = new cms_testimonials_Controller();
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
//     "img",
//     // [
//     //   { name: "pancard_image", maxCount: 1 },
//     //   { name: "agency_logo", maxCount: 1 },
//     // ],
//     "uploads/images/cms_testimonials" // ""
//   ),
//   adminUserAuth,
//   (req, res) => cms_testimonials_controller.add_cms_testimonials(req, res)
// );

router.post(
  "/",
  (req, res, next) => {
    // Set the destination path in the multerMiddleware module
    multerMiddleware.setDestinationPath("public/images/cms_testimonials");

    // Use the multerMiddleware.upload middleware for handling file uploads
    multerMiddleware.upload.fields([{ name: "img", maxCount: 1 }])(req, res, (err) => {
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
  (req, res) => cms_testimonials_controller.add_cms_testimonials(req, res)
);

router.get("/", adminUserAuth, (req, res) => cms_testimonials_controller.display_cms_testimonials(req, res));

router.get("/all", adminUserAuth, (req, res) => cms_testimonials_controller.display_all_cms_testimonials(req, res));

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "single",
//     "img",
//     "uploads/images/cms_testimonials" // ""
//   ),
//   adminUserAuth,
//   (req, res) => cms_testimonials_controller.update_cms_testimonials(req, res)
// );

router.put(
  "/",
  (req, res, next) => {
    // Set the destination path in the multerMiddleware module
    multerMiddleware.setDestinationPath("public/images/cms_testimonials");

    // Use the multerMiddleware.upload middleware for handling file uploads
    multerMiddleware.upload.fields([{ name: "img", maxCount: 1 }])(req, res, (err) => {
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
  (req, res) => cms_testimonials_controller.update_cms_testimonials(req, res)
);

router.delete("/delete", adminUserAuth, (req, res) => cms_testimonials_controller.delete_cms_testimonials(req, res));

module.exports = router;
