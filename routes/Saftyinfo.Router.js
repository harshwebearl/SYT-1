const express = require("express");
const router = express.Router();
const SaftyinfoController = require("../controllers/Safetyinfo.Controller");
const SafetyInfo = new SaftyinfoController();
const { uploadFile } = require("../middleware/genericMulter.js");
// const { uploadFile } = require("../middleware/genericMulter.js");
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");
// router.post(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "single",
//     "photo",
//     "uploads/images/safetyinfo" // ""
//   ),
//   (req, res) => SafetyInfo.AddSafetyinfo(req, res)
// );
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/safetyinfo"); // Set the destination folder for uploaded files
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
const cp = upload.fields([{ name: "photo", maxCount: 1 }]);
router.post("/", cp, (req, res) => SafetyInfo.AddSafetyinfo(req, res));

// router.post(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "single",
//     "photo",
//     // [
//     //   { name: "pancard_image", maxCount: 1 },
//     //   { name: "agency_logo", maxCount: 1 },
//     // ],
//     "uploads/images/safetyinfo" // ""
//   ),
//   (req, res) => SafetyInfo.AddSafetyinfo(req, res)
// );

router.get("/", (req, res) => SafetyInfo.Displaysafetyinfo(req, res));

module.exports = router;
