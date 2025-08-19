const express = require("express");
const router = express.Router();
const _ReminderController = require("../controllers/timeline.controller");
const ReminderController = new _ReminderController();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => ReminderController.createReminder(req, res));

router.get("/all", adminUserAuth, (req, res) => ReminderController.displayReminderList(req, res));

router.get("/", adminUserAuth, (req, res) => ReminderController.displayReminder(req, res));

router.put("/", adminUserAuth, (req, res) => ReminderController.updateReminder(req, res));

router.delete("/delete", adminUserAuth, (req, res) => ReminderController.deleteReminder(req, res));

module.exports = router;
