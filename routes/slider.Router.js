const express = require("express");
const router = express.Router();
const slider_Controller = require("../controllers/slider.Controller");
const slider_controller = new slider_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const multer = require("multer");
// router.post(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [{ name: "photo", maxCount: 5 }],
//     "uploads/images/slider" // ""
//   ),
//   (req, res) => slider_controller.addsider(req, res)
// );
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/slider"); // Set the destination folder for uploaded files
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
const cp = upload.fields([{ name: "photo", maxCount: 5 }]);
router.post("/", cp, (req, res) => slider_controller.addsider(req, res));

// router.get("/all", adminUserAuth, (req, res) => slider_controller.display_all_slider(req, res));

// router.get("/", adminUserAuth, (req, res) => slider_controller.display_slider(req, res));

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [{ name: "photo", maxCount: 5 }],
//     "uploads/images/slider" // ""
//   ),
//   (req, res) => slider_controller.updatesider(req, res)
// );

router.put("/", cp, (req, res) => slider_controller.updatesider(req, res));

router.delete("/delete", adminUserAuth, (req, res) => slider_controller.delete_slider(req, res));

module.exports = router;
