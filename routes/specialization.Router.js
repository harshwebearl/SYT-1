const express = require("express");
const router = express.Router();
const specialization_Controller = require("../controllers/specialization.Controller");
const specialization_controller = new specialization_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");
const path = require("path");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/uploads/images/specialization");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });

// router.post(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "single",
//     "img",
//     "uploads/images/specialization" // ""
//   ),
//   adminUserAuth,
//   (req, res) => specialization_controller.add_specialization(req, res)
// );

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/specialization"); // Set the destination folder for uploaded files
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
const cp = upload.fields([{ name: "img", maxCount: 1 }]);
router.post("/", cp, adminUserAuth, (req, res) => specialization_controller.add_specialization(req, res));

router.get("/", adminUserAuth, (req, res) => specialization_controller.display_specialization(req, res));

router.get("/all", adminUserAuth, (req, res) => specialization_controller.display_all_specialization(req, res));

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "single",
//     "img",
//     "uploads/images/specialization" // ""
//   ),
//   adminUserAuth,
//   (req, res) => specialization_controller.update_specialization(req, res)
// );

router.put("/", cp, adminUserAuth, (req, res) => specialization_controller.update_specialization(req, res));

router.delete("/delete", adminUserAuth, (req, res) => specialization_controller.delete_specialization(req, res));

module.exports = router;
