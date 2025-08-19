const express = require("express");
const router = express.Router();
const cfar_Controller = require("../controllers/Cfar.Controller");
const cfar_controller = new cfar_Controller();
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/cfar"); // Set the destination folder for uploaded files
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
//user registration
// router.post(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "single",
//     "img",
//     // [
//     //   { name: "pancard_image", maxCount: 1 },
//     //   { name: "agency_logo", maxCount: 1 },
//     // ],
//     "uploads/images/cfar" // ""
//   ),
//   adminUserAuth,
//   (req, res) => cfar_controller.add_cfar(req, res)
// );
router.post("/", cp, adminUserAuth, (req, res) => cfar_controller.add_cfar(req, res));

// router.post("/checkmobilenumber", (req, res) => userController.checkmobile_number(req, res));

// //display user data
router.get("/", adminUserAuth, (req, res) => cfar_controller.display_cfar(req, res));

router.get("/all", (req, res) => cfar_controller.display_all_cfar(req, res));

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "single",
//     "img",
//     // [
//     //   { name: "pancard_image", maxCount: 1 },
//     //   { name: "agency_logo", maxCount: 1 },
//     // ],
//     "uploads/images/cfar" // ""
//   ),
//   adminUserAuth,
//   (req, res) => cfar_controller.update_cfar(req, res)
// );

router.put("/", cp, adminUserAuth, (req, res) => cfar_controller.update_cfar(req, res));

// //delete user
router.delete("/:id", (req, res) => cfar_controller.delete_cfar(req, res));

module.exports = router;
