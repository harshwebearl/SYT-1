const express = require("express");
const router = express.Router();
const auto_car_Controller = require("../controllers/auto_car.Controller");
const auto_car_controller = new auto_car_Controller();
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
//     // "img",
//     [{ name: "img", maxCount: 1 }],
//     "uploads/images/auto_car" // ""
//   ),
//   adminUserAuth,
//   (req, res) => auto_car_controller.add_auto_car(req, res)
// );
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/amenities"); // Set the destination folder for uploaded files
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
router.post("/", cp, adminUserAuth, (req, res) => auto_car_controller.add_auto_car(req, res));

router.get("/", adminUserAuth, (req, res) => auto_car_controller.display_auto_car(req, res));

router.get("/all", adminUserAuth, (req, res) => auto_car_controller.display_all_auto_car(req, res));

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     // "img",
//     [{ name: "img", maxCount: 1 }],
//     "uploads/images/auto_car" // ""
//   ),
//   adminUserAuth,
//   (req, res) => auto_car_controller.update_auto_car(req, res)
// );

router.put("/", cp, adminUserAuth, (req, res) => auto_car_controller.update_auto_car(req, res));

router.delete("/delete", adminUserAuth, (req, res) => auto_car_controller.delete_auto_car(req, res));

module.exports = router;
