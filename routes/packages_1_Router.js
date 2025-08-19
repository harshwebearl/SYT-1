const express = require("express");
const router = express.Router();
const package_1_Controller = require("../controllers/package1.Controller");
const package_1_controller = new package_1_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter");
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");
// router.post(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "tour_gallery", maxCount: 10 },
//       { name: "thumb_img", maxCount: 1 }
//     ],
//     "uploads/images/packages" // ""
//   ),
//   adminUserAuth,
//   (req, res) => package_1_controller.add_package_1(req, res)
// );
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/packages_1_Router"); // Set the destination folder for uploaded files
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
const cp = upload.fields([
  { name: "tour_gallery", maxCount: 10 },
  { name: "thumb_img", maxCount: 1 }
]);
router.post("/", cp, adminUserAuth, (req, res) => package_1_controller.add_package_1(req, res));
router.get("/all", adminUserAuth, (req, res) => package_1_controller.display_all_package_1(req, res));

router.get("/", adminUserAuth, (req, res) => package_1_controller.display_package_1(req, res));

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "tour_gallery", maxCount: 10 },
//       { name: "thumb_img", maxCount: 1 }
//     ],
//     "uploads/images/packages" // ""
//   ),
//   adminUserAuth,
//   (req, res) => package_1_controller.update_package_1(req, res)
// );
router.put("/", cp, adminUserAuth, (req, res) => package_1_controller.update_package_1(req, res));

router.delete("/delete", adminUserAuth, (req, res) => package_1_controller.delete_package_1(req, res));

module.exports = router;
