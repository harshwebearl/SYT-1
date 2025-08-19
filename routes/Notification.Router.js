const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/Notfication.Controller");
const notificationcontroller = new NotificationController();
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");

router.post("/", adminUserAuth, (req, res) => notificationcontroller.AddNotificationdata(req, res));

router.get("/", adminUserAuth, (req, res) => notificationcontroller.DisplaynotificationForAgency(req, res));

router.get("/admin", adminUserAuth, (req, res) => notificationcontroller.DisplaynotificationForAdmin(req, res));

router.get("/customer", adminUserAuth, (req, res) => notificationcontroller.DisplaynotificationForCustomer(req, res));

router.put("/update", adminUserAuth, (req, res) => notificationcontroller.Notificationdataupdate(req, res));

module.exports = router;
