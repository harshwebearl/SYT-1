const express = require("express");
const router = express.Router();
const room_Controller = require("../controllers/room.Controller");
const room_controller = new room_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const multer = require("multer");
const path = require("path");
const multerMiddleware = require("../middleware/sytmulter.js");
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/uploads/images/room");
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
//     [
//       { name: "thumb_img", maxCount: 1 },
//       { name: "banner_img", maxCount: 1 },
//       { name: "currency_img", maxCount: 1 }
//     ],
//     "uploads/images/room" // ""
//   ),
//   adminUserAuth,
//   (req, res) => room_controller.add_room(req, res)
// );
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/room"); // Set the destination folder for uploaded files
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
  { name: "thumb_img", maxCount: 1 },
  { name: "banner_img", maxCount: 1 },
  { name: "currency_img", maxCount: 1 }
]);
router.post("/", cp, adminUserAuth, (req, res) => room_controller.add_room(req, res));

router.get("/", adminUserAuth, (req, res) => room_controller.display_room(req, res));

router.get("/all", adminUserAuth, (req, res) => room_controller.display_all_room(req, res));

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "thumb_img", maxCount: 1 },
//       { name: "banner_img", maxCount: 1 },
//       { name: "currency_img", maxCount: 1 }
//     ],
//     "uploads/images/room" // ""
//   ),
//   adminUserAuth,
//   (req, res) => room_controller.update_room(req, res)
// );

router.put("/", cp, adminUserAuth, (req, res) => room_controller.update_room(req, res));

router.delete("/delete", adminUserAuth, (req, res) => room_controller.delete_room(req, res));

module.exports = router;
