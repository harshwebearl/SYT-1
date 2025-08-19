const express = require("express");
const router = express.Router();
const quotation_Controller = require("../controllers/quotation.controller");
const quotation_controller = new quotation_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter");
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/image/quotation"); // Set the destination folder for uploaded files
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
// router.post(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "tour_gallery", maxCount: 10 },
//       { name: "thumb_img", maxCount: 1 }
//     ],
//     "uploads/images/quotation" // ""
//   ),
//   adminUserAuth,
//   (req, res, next) => quotation_controller.add_qutation(req, res, next)
// );
router.post("/", cp, adminUserAuth, (req, res, next) => quotation_controller.add_qutation(req, res, next));

router.get("/all", adminUserAuth, (req, res) => quotation_controller.display_all_qutation(req, res));

router.get("/", adminUserAuth, (req, res) => quotation_controller.display_qutation(req, res));

router.put("/finalize", adminUserAuth, (req, res) => quotation_controller.finalizequtation(req, res));

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "tour_gallery", maxCount: 10 },
//       { name: "thumb_img", maxCount: 1 }
//     ],
//     "uploads/images/quotation" // ""
//   ),
//   adminUserAuth,
//   (req, res) => quotation_controller.update_qutation(req, res)
// );

router.put("/", cp, adminUserAuth, (req, res) => quotation_controller.update_qutation(req, res));

router.delete("/delete", adminUserAuth, (req, res) => quotation_controller.delete_qutation(req, res));

module.exports = router;
