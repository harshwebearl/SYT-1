const express = require("express");
const router = express.Router();
const blogger_syt_controller = require("../controllers/blogger_syt_controller");
const multer = require("multer");

// const auth = require("../middleware/auth");
const blogger_syt_class = new blogger_syt_controller();

const storage = multer.diskStorage({
  destination: "public/images/blogger",
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname.replace(/\s+/g, "")); // Save the file with its original name
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limitfileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload a valid image file"));
    }
    cb(null, true);
  }
});

router.post("/", upload.single("blog_owner_photo"), (req, res) => blogger_syt_class.add_blogger(req, res));
router.post("/blogecontent", upload.single("blog_title_photo"), (req, res) =>
  blogger_syt_class.add_blog_content(req, res)
);
router.get("/", (req, res) => blogger_syt_class.list_blogger(req, res));
router.get("/detail", (req, res) => blogger_syt_class.detail_blogger(req, res));
router.get("/blogger", (req, res) => blogger_syt_class.get_blogger_by_id(req, res));
router.get("/bloglist", (req, res) => blogger_syt_class.get_blog_content_list(req, res));
router.get("/blogecontentforuser", (req, res) => blogger_syt_class.get_blog_content_by_id_for_customer(req, res));
router.get("/blogecontent", (req, res) => blogger_syt_class.get_blog_content_by_id(req, res));
router.get("/listblogger", (req, res) => blogger_syt_class.get_list_blogger(req, res));
router.get("/blogecontentbybloggerid", (req, res) => blogger_syt_class.get_blog_content_by_blogger_id(req, res));
router.put("/", upload.single("blog_owner_photo"), (req, res) => blogger_syt_class.update_blogger(req, res));
router.put("/blogecontent", upload.single("blog_title_photo"), (req, res) =>
  blogger_syt_class.update_blog_content(req, res)
);
router.delete("/", (req, res) => blogger_syt_class.delete_blogger(req, res));
router.delete("/blogecontent", (req, res) => blogger_syt_class.delete_blog_content(req, res));

module.exports = router;
