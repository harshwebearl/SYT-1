const express = require("express");
const router = express.Router();
const setting_booking_restriction_Controller = require("../controllers/setting_booking_restriction_Controller");
const setting_booking_restriction_controller = new setting_booking_restriction_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) =>
  setting_booking_restriction_controller.add_setting_booking_restriction(req, res)
);

router.get("/", adminUserAuth, (req, res) =>
  setting_booking_restriction_controller.display_setting_booking_restriction(req, res)
);

router.get("/all", adminUserAuth, (req, res) =>
  setting_booking_restriction_controller.display_all_setting_booking_restriction(req, res)
);

router.put("/", adminUserAuth, (req, res) =>
  setting_booking_restriction_controller.update_setting_booking_restriction(req, res)
);

router.delete("/delete", adminUserAuth, (req, res) =>
  setting_booking_restriction_controller.delete_setting_booking_restriction(req, res)
);

module.exports = router;
