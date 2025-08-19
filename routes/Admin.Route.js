const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/Admin.Controller");
const adminController = new AdminController();

// const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");

// All Login
router.post("/login", (req, res) => adminController.loginAll(req, res));

// Register Admin
router.post("/", (req, res) => adminController.createAdmin(req, res));

// Get AdminProfile
router.get("/", isAuthAllowed(["agency", "user", "admin"]), (req, res) => adminController.getAdmin(req, res));

// Update AdminProfile
router.put("/:id", isAuthAllowed(["agency", "user", "admin"]), (req, res) => adminController.updateAdmin(req, res));

// Delete Admin
router.delete("/:id", isAuthAllowed(["agency", "user", "admin"]), (req, res) => adminController.deleteAdmin(req, res));

router.get("/display_dashboard_details", (req, res) => adminController.display_dashboard_details(req, res));

// Update NotificationTokens
router.post("/updateNotificationTokens", isAuthAllowed(["agency", "user", "admin"]), (req, res) =>
  adminController.updateNotificationTokens(req, res)
);

router.post("/forgetPassword", (req, res) => adminController.forget_password(req, res));

router.post("/send-otp", (req, res) => adminController.send_otp(req, res));
router.post("/verify-otp", (req, res) => adminController.verify_otp(req, res));

router.get("/dashboard", (req, res) => adminController.admin_dashboard(req, res));

module.exports = router;
