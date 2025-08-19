const express = require("express");
const router = express.Router();
const hotel_Controller = require("../controllers/pkg_hotel.Controller");
const hotel_controller = new hotel_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");
const path = require("path");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/uploads/images/hotel");
//   },
//   filename: function (req, file, cb) {
//     // cb(null,file.fieldname + "_"+ Date.now() + path.extname(file.originalname))
//     // console.log(file);
//     if (file.originalname.length > 6)
//       cb(
//         null,
//         file.fieldname +
//           "-" +
//           Date.now() +
//           file.originalname.substr(file.originalname.length - 6, file.originalname.length)
//       );
//     else cb(null, file.fieldname + "-" + Date.now() + file.originalname);
//   }
// });

// const upload = multer({ storage: storage });

// router.post(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [{ name: "images", maxCount: 10 }],
//     "uploads/images/hotel" // ""
//   ),
//   adminUserAuth,
//   (req, res) => hotel_controller.add_hotel(req, res)
// );
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/pkg_hotel"); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, (Date.now() + file.originalname).replace(/\s+/g, "")); // Set a unique filename for the uploaded file
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload a valid image file"));
    }
    cb(null, true);
  }
});

// Set the upload limits for files
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  }
});
const cp = upload.fields([{ name: "images", maxCount: 10 }]);
router.post("/", cp, adminUserAuth, (req, res) => hotel_controller.add_hotel(req, res));

router.get("/", adminUserAuth, (req, res) => hotel_controller.display_hotel(req, res));

router.get("/all", adminUserAuth, (req, res) => hotel_controller.display_all_hotel(req, res));

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [{ name: "images", maxCount: 10 }],
//     "uploads/images/room" // ""
//   ),
//   adminUserAuth,
//   (req, res) => hotel_controller.update_hotel(req, res)
// );

router.put("/", cp, adminUserAuth, (req, res) => hotel_controller.update_hotel(req, res));
router.delete("/delete", adminUserAuth, (req, res) => hotel_controller.delete_hotel(req, res));

module.exports = router;
