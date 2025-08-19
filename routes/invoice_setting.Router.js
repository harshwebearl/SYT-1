const express = require("express");
const router = express.Router();
const invoice_setting_Controller = require("../controllers/invoice_setting.Controller");
const invoice_setting_controller = new invoice_setting_Controller();
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
//       { name: "invoice_logo", maxCount: 1 },
//       { name: "digital_signature", maxCount: 1 }
//     ],
//     "uploads/images/invoice_setting" // ""
//   ),
//   adminUserAuth,
//   (req, res) => invoice_setting_controller.add_invoice_setting(req, res)
// );
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/invoice_setting"); // Set the destination folder for uploaded files
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
  { name: "invoice_logo", maxCount: 1 },
  { name: "digital_signature", maxCount: 1 }
]);
router.post("/", cp, adminUserAuth, (req, res) => invoice_setting_controller.add_invoice_setting(req, res));

router.get("/", adminUserAuth, (req, res) => invoice_setting_controller.display_invoice_setting(req, res));

router.get("/all", adminUserAuth, (req, res) => invoice_setting_controller.display_all_invoice_setting(req, res));

router.put("/", cp, adminUserAuth, (req, res) => invoice_setting_controller.update_invoice_setting(req, res));

router.delete("/delete", adminUserAuth, (req, res) => invoice_setting_controller.delete_invoice_setting(req, res));

module.exports = router;
