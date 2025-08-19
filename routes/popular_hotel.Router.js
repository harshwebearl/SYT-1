const express = require("express");
const router = express.Router();
const popular_hotel_Controller = require("../controllers/popular_hotel.Controller");
const popular_hotel_controller = new popular_hotel_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");
const path = require("path");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/uploads/images/popular_hotels");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/popularhotel"); // Set the destination folder for uploaded files
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
router.post("/", cp, adminUserAuth, (req, res) => popular_hotel_controller.add_popular_hotel(req, res));

router.get("/", adminUserAuth, (req, res) => popular_hotel_controller.display_popular_hotel(req, res));

router.get("/all", adminUserAuth, (req, res) => popular_hotel_controller.display_all_popular_hotel(req, res));

router.put("/", cp, adminUserAuth, (req, res) => popular_hotel_controller.update_popular_hotel(req, res));

router.delete("/delete", adminUserAuth, (req, res) => popular_hotel_controller.delete_popular_hotel(req, res));

module.exports = router;
