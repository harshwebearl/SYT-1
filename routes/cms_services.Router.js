const express = require("express");
const router = express.Router();
const cms_services_Controller = require("../controllers/cms_services.Controller");
const cms_services_controller = new cms_services_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const multer = require("multer");
const path = require("path");
const multerMiddleware = require("../middleware/sytmulter.js");

// router.post(
//   "/",
//   adminUserAuth,
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "image", maxCount: 1 },
//       { name: "img", maxCount: 9 }
//     ],
//     "uploads/images/cms_services" // ""
//   ),
//   (req, res) => cms_services_controller.add_cms_services(req, res)
// );

router.post(
  "/",
  adminUserAuth,
  (req, res, next) => {
    // Set the destination path in the multerMiddleware module
    multerMiddleware.setDestinationPath("public/images/cms_services");

    // Use the multerMiddleware.upload middleware for handling file uploads
    multerMiddleware.upload.fields([
      { name: "image", maxCount: 1 },
      { name: "img", maxCount: 9 }
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
  (req, res) => cms_services_controller.add_cms_services(req, res)
);

router.get("/", adminUserAuth, (req, res) => cms_services_controller.display_cms_services(req, res));

router.get("/all", adminUserAuth, (req, res) => cms_services_controller.display_all_cms_services(req, res));

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "image", maxCount: 1 },
//       { name: "img", maxCount: 9 }
//     ],
//     "uploads/images/cms_services" // ""
//   ),
//   adminUserAuth,
//   (req, res) => cms_services_controller.update_cms_services(req, res)
// );

router.put(
  "/",
  (req, res, next) => {
    // Set the destination path in the multerMiddleware module
    multerMiddleware.setDestinationPath("public/images/cms_services");

    // Use the multerMiddleware.upload middleware for handling file uploads
    multerMiddleware.upload.fields([
      { name: "image", maxCount: 1 },
      { name: "img", maxCount: 9 }
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
  (req, res) => cms_services_controller.update_cms_services(req, res)
);

router.delete("/delete", adminUserAuth, (req, res) => cms_services_controller.delete_cms_services(req, res));

module.exports = router;
