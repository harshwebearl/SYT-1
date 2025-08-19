const express = require("express");
const router = express.Router();
const DestinestionController = require("../controllers/DestinationCategory.Controller");
const destinationCategory = new DestinestionController();

const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");

// router.post(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE, //           "local"   /   "aws"
//     "photo", //        "single"  / "fields"
//     //                          /   [
//     //          "agency_logo"   /       { name: "pancard_image", maxCount: 1 },
//     //                          /       { name: "agency_logo", maxCount: 1 },
//     //                          /   ],
//     "photo",
//     "uploads/images/destinationCategory" // "File Location"
//   ),
//   adminUserAuth,
//   (req, res) => destinationCategory.imagestore(req, res)
// );
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/dastinationcategory"); // Set the destination folder for uploaded files
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

router.post("/", upload.single("photo"), adminUserAuth, (req, res) => destinationCategory.imagestore(req, res));

router.get("/", (req, res) => destinationCategory.ShowDestinationData(req, res));

router.put("/", adminUserAuth, (req, res) => destinationCategory.update_category_status(req, res));

router.put("/:id", upload.single("photo"), adminUserAuth, (req, res) => destinationCategory.updateDestinationdetail(req, res));

router.delete("/:id", adminUserAuth, (req, res) => destinationCategory.DeleteDestinationcategory(req, res));

module.exports = router;
