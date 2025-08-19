const express = require("express");
const router = express.Router();
const notification_message_master_Controller = require("../controllers/notification_message_master_Controller");
const notification_message_master_controller = new notification_message_master_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) =>
  notification_message_master_controller.add_notification_message_master(req, res)
);

router.get("/", adminUserAuth, (req, res) =>
  notification_message_master_controller.delete_notification_message_master(req, res)
);

router.get("/all", adminUserAuth, (req, res) =>
  notification_message_master_controller.display_all_notification_message_master(req, res)
);

router.put("/", adminUserAuth, (req, res) =>
  notification_message_master_controller.update_notification_message_master(req, res)
);

router.delete("/delete", adminUserAuth, (req, res) =>
  notification_message_master_controller.delete_notification_message_master(req, res)
);

module.exports = router;
