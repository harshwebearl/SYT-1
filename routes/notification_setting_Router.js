const express = require("express");
const router = express.Router();
const notification_setting_Controller = require("../controllers/notification_setting.Controller");
const notification_setting_controller = new notification_setting_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => notification_setting_controller.add_notification_setting(req, res));

router.put("/", adminUserAuth, (req, res) => notification_setting_controller.update_notification_setting(req, res));

router.get("/", adminUserAuth, (req, res) => notification_setting_controller.get_notification_setting(req, res));

module.exports = router;
