const express = require("express");
const router = express.Router();
const UserController = require("../controllers/customer.Controller");
const userController = new UserController();
const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const multer = require("multer");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/users");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname.replace(/\s+/g, "")}`);
  }
});

// Configure Multer with file size limit and image filter
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
      return cb(new Error("Please upload a valid image file (jpg, jpeg, or png)"));
    }
    cb(null, true);
  }
});

// User registration
router.post("/", userController.register.bind(userController));

// Check mobile number
router.post("/checkmobilenumber", userController.checkmobile_number.bind(userController));

// Get all users
router.get("/", adminUserAuth, userController.getUsers.bind(userController));

// Get all users by admin
router.get("/alluserlist", adminUserAuth, userController.display_all_user_list_by_admin.bind(userController));

// Get user details by admin
router.get("/userdetail", adminUserAuth, userController.display_all_user_detail_by_admin.bind(userController));

// Password management
router.put("/chengepassword", userController.forgotPassword.bind(userController)); // Note: Typo in "chengepassword"
router.put("/updatepassword", adminUserAuth, userController.updatePassword.bind(userController));

// Delete user by ID
router.delete("/:id", adminUserAuth, userController.deleteUser.bind(userController));

// Get user profile (authenticated)
router.get("/userprofile", adminUserAuth, userController.userInfo.bind(userController));

// Get user history
router.get("/history", adminUserAuth, userController.usershistory.bind(userController));

// OTP routes
router.post("/send-otp", userController.send_otp.bind(userController));
router.post("/verify-otp", userController.verify_otp.bind(userController));

// Update profile with image upload
router.put("/changeprofile", upload.single("photo"), userController.updateProfile.bind(userController));

module.exports = router;
