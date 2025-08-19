const express = require("express");
const router = express.Router();
const highlights_controller = require("../controllers/highlights_controller");
const multer = require("multer");
const adminUserAuth = require("../middleware/admin-user-auth");

const highlights_controller_class = new highlights_controller();

// const storage = multer.diskStorage({
//   destination: "public/images/highlights/",
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + file.originalname.replace(/\s+/g, "")); // Save the file with its original name
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     // console.log(file.originalname);
//     if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//       return cb(new Error("Please upload a valid image file"));
//     }
//     cb(null, true);
//   }
// });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/highlights"); // Set the destination folder for uploaded files
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

router.post("/", adminUserAuth, upload.single("icon"), (req, res) => highlights_controller_class.add_highlight(req, res));
router.get("/", adminUserAuth, (req, res) => highlights_controller_class.get_highlight(req, res));
router.get("/detail", adminUserAuth, (req, res) => highlights_controller_class.get_detail_highlight(req, res));
router.put("/", adminUserAuth, upload.single("icon"), (req, res) => highlights_controller_class.update_highlight(req, res));
router.delete("/", adminUserAuth, (req, res) => highlights_controller_class.delete_highlight(req, res));

module.exports = router;
