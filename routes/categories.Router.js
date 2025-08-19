const express = require("express");
const router = express.Router();
const categories_Controller = require("../controllers/categories.Controller");
const categories_controller = new categories_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const path = require("path");
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/uploads/images/categories");
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
//     // [
//     //   { name: "pancard_image", maxCount: 1 },
//     //   { name: "agency_logo", maxCount: 1 },
//     // ],
//     "uploads/images/categories" // ""
//   ),
//   adminUserAuth,
//   (req, res) => categories_controller.add_categories(req, res)
// );
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/images/categories"); // Set the destination folder for uploaded files
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
  { name: "pancard_image", maxCount: 1 },
  { name: "agency_logo", maxCount: 1 }
]);
router.post("/", cp, adminUserAuth, (req, res) => categories_controller.add_categories(req, res));

router.get("/", adminUserAuth, (req, res) => categories_controller.display_categories(req, res));

router.get("/all", adminUserAuth, (req, res) => categories_controller.display_all_categories(req, res));

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
//     "uploads/images/categories" // ""
//   ),
//   adminUserAuth,
//   (req, res) => categories_controller.update_categories(req, res)
// );

router.put("/", cp, adminUserAuth, (req, res) => categories_controller.update_categories(req, res));

router.delete("/delete", adminUserAuth, (req, res) => categories_controller.delete_categories(req, res));

module.exports = router;
