const express = require("express");
const router = express.Router();
const AgencyController = require("../controllers/Agency.Controller");
const agencyController = new AgencyController();
const adminUserAuth = require("../middleware/admin-user-auth");
// const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");
// isAuthAllowed(["agency","user","admin"]),
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");
// Set the destination path based on the router's logic
const destinationPath = "public/images/agency"; // Change this according to your logic
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, destinationPath); // Set the destination folder for uploaded files
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
})
const cp = upload.fields([
  { name: "agency_logo", maxCount: 1 }
]);

// Register Agency
// router.post(
//   "/",
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "pancard_image", maxCount: 1 },
//       { name: "agency_logo", maxCount: 1 }
//     ],
//     "uploads/images/agency" // ""
//   ),
//   (req, res) => agencyController.RegisterAgency(req, res)
// );
router.post("/", cp, (req, res) => agencyController.RegisterAgency(req, res));

router.get("/agencylist", adminUserAuth, (req, res) => agencyController.display_all_agency_list_by_admin(req, res));

// Get AgencyProfile
router.get("/profile", adminUserAuth, (req, res) => agencyController.display_agency_profile(req, res));

router.get("/agencydetails", adminUserAuth, (req, res) => agencyController.agency_full_detail_by_admin(req, res));

// Get AgencyList
router.get("/", adminUserAuth, (req, res) => agencyController.getAgencyData(req, res));

// Get AgencyList with History
router.get("/agencyhistory", adminUserAuth, (req, res) => agencyController.agency_history(req, res));

router.get("/agencydashboard", adminUserAuth, (req, res) => agencyController.Agency_Dashboard(req, res));

// Update AgencyProfile
// router.put(
//   "/",
//   adminUserAuth,
//   uploadFile(
//     process?.env?.ACTIVE_STORAGE,
//     "fields",
//     [
//       { name: "pancard_image", maxCount: 1 },
//       { name: "agency_logo", maxCount: 1 }
//     ], // String for single, Arr for fields
//     "uploads/images/agency" // ""
//   ),
//   (req, res) => agencyController.updateAgencyDetail(req, res)
// );
router.put("/", adminUserAuth, cp, (req, res) => agencyController.updateAgencyDetail(req, res));

// Agency ForgotPassword
router.put("/forgatepassword", (req, res) => agencyController.Agency_forgot_Password(req, res));

// Agency ChangePassword
router.put("/chengepassword", (req, res) => agencyController.agency_change_Password(req, res));

// Delete Agency
router.delete("/:id", (req, res) => agencyController.deleteAgency(req, res));

// Update AgencyActiveStatus
router.put("/status", adminUserAuth, (req, res) => agencyController.allowAgency(req, res));

router.post("/send-otp", (req, res) => agencyController.send_otp(req, res));
router.post("/verify-otp", (req, res) => agencyController.verify_otp(req, res));

module.exports = router;
