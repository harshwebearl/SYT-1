const express = require("express");
const router = express.Router();
const room_controller = require("../controllers/room_syt_controller");
const multer = require("multer");

const room_controller_class = new room_controller();

const storage = multer.diskStorage({
  destination: "public/images/room_syt",
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname.replace(/\s+/g, "")); // Save the file with its original name
  }
});

const upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 1024 * 1024 * 5 // 5MB file size limitfileSize: 1000000
  // },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload a valid image file"));
    }
    cb(null, true);
  }
});

router.post("/", upload.array("photos"), (req, res) => room_controller_class.add_room(req, res));
router.get("/", (req, res) => room_controller_class.get_room(req, res));
router.get("/byid", (req, res) => room_controller_class.get_room_byid(req, res));
router.put("/", upload.array("photos"), (req, res) => room_controller_class.update_room(req, res));
router.delete("/", (req, res) => room_controller_class.delete_room(req, res));

module.exports = router;
