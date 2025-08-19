const express = require("express");
const router = express.Router();
const cms_blogs_Controller = require("../controllers/cms_blogs.Controller");
const cms_blogs_controller = new cms_blogs_Controller();
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
//       { name: "img", maxCount: 1 },
//       { name: "banners_img", maxCount: 10 },
//       { name: "contents_img", maxCount: 10 }
//     ],
//     "uploads/images/cms_blogs" // ""
//   ),
//   adminUserAuth,
//   (req, res) => cms_blogs_controller.add_cms_blogs(req, res)
// );
router.post(
  "/",
  (req, res, next) => {
    // Set the destination path in the multerMiddleware module
    multerMiddleware.setDestinationPath("public/images/cms_blogs");

    // Use the multerMiddleware.upload middleware for handling file uploads
    multerMiddleware.upload.fields([
      { name: "img", maxCount: 1 },
      { name: "banners_img", maxCount: 10 },
      { name: "contents_img", maxCount: 10 }
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
  (req, res) => cms_blogs_controller.add_cms_blogs(req, res)
);

router.get("/", adminUserAuth, (req, res) => cms_blogs_controller.display_cms_blogs(req, res));

router.get("/all", adminUserAuth, (req, res) => cms_blogs_controller.display_all_cms_blogs(req, res));

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "img", maxCount: 1 },
//       { name: "banners_img", maxCount: 10 },
//       { name: "contents_img", maxCount: 10 }
//     ],
//     "uploads/images/cms_blogs" // ""
//   ),
//   adminUserAuth,
//   (req, res) => cms_blogs_controller.update_cms_blogs(req, res)
// );

router.put(
  "/",
  (req, res, next) => {
    // Set the destination path in the multerMiddleware module
    multerMiddleware.setDestinationPath("public/images/cms_blogs");

    // Use the multerMiddleware.upload middleware for handling file uploads
    multerMiddleware.upload.fields([
      { name: "img", maxCount: 1 },
      { name: "banners_img", maxCount: 10 },
      { name: "contents_img", maxCount: 10 }
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
  (req, res) => cms_blogs_controller.update_cms_blogs(req, res)
);

router.delete("/delete", adminUserAuth, (req, res) => cms_blogs_controller.delete_cms_blogs(req, res));

module.exports = router;
