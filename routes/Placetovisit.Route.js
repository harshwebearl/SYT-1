const express = require("express");
const router = express.Router();
const PlacetovisitController = require("../controllers/PlaceToVisit.Controller");
const Placetovisit = new PlacetovisitController();
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");
// router.post(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "single",
//     "photo",
//     // [
//     //   { name: "pancard_image", maxCount: 1 },
//     //   { name: "agency_logo", maxCount: 1 },
//     // ],
//     "uploads/images/placetovisit" // ""
//   ),
//   (req, res) => Placetovisit.PlacetovisitPhoto(req, res)
// );
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/placephoto"); // Set the destination folder for uploaded files
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
const cp = upload.fields([{ name: "photo", maxCount: 1 }]);

router.post("/", cp, (req, res) => Placetovisit.PlacetovisitPhoto(req, res));

router.get("/", (req, res) => Placetovisit.getPlaceToVisitList(req, res));

router.get("/details", (req, res) => Placetovisit.display_place_to_visit_by_id(req, res));

router.get("/:id", (req, res) => Placetovisit.getPlaceToVisitListByDestId(req, res));

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "single",
//     "photo",
//     // [
//     //   { name: "pancard_image", maxCount: 1 },
//     //   { name: "agency_logo", maxCount: 1 },
//     // ],
//     "uploads/images/placetovisit" // ""
//   ),

//   (req, res) => Placetovisit.updatePlaceToVisit(req, res)
// );

// router.put(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "single",
//     "photo",
//     "uploads/images/placetovisit" // ""
//   ),
//   adminUserAuth,
//   (req, res) => Placetovisit.update_placetovisit(req, res)
// );

router.put("/", cp, adminUserAuth, (req, res) => Placetovisit.update_placetovisit(req, res));

// router.put("/:id", (req, res) => Placetovisit.updatePlaceToVisit(req, res));

router.delete("/:id", (req, res) => Placetovisit.DeletePlacedata(req, res));

module.exports = router;
