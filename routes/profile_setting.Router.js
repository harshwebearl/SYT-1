const express = require("express");
const router = express.Router();
const profile_setting_Controller = require("../controllers/profile_setting.Controller");
const profile_setting_controller = new profile_setting_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/profile_setting"); // Set the destination folder for uploaded files
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
  { name: "logo", maxCount: 1 },
  { name: "partner_image", maxCount: 7 }
]);
// router.post(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "logo", maxCount: 1 },
//       { name: "partner_image", maxCount: 7 }
//     ],
//     "uploads/images/profile_setting" // ""
//   ),
//   adminUserAuth,
//   (req, res) => profile_setting_controller.add_profile_setting(req, res)
// );

router.post("/", cp, adminUserAuth, (req, res) => profile_setting_controller.add_profile_setting(req, res));

router.get("/", adminUserAuth, (req, res) => profile_setting_controller.display_profile_setting(req, res));

router.get("/all", adminUserAuth, (req, res) => profile_setting_controller.display_all_profile_setting(req, res));

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "logo", maxCount: 1 },
//       { name: "partner_image", maxCount: 7 }
//     ],
//     "uploads/images/profile_setting" // ""
//   ),
//   adminUserAuth,
//   (req, res) => profile_setting_controller.update_profile_setting(req, res)
// );

router.put("/", cp, adminUserAuth, (req, res) => profile_setting_controller.update_profile_setting(req, res));

router.delete("/delete", adminUserAuth, (req, res) => profile_setting_controller.delete_profile_setting(req, res));

module.exports = router;
