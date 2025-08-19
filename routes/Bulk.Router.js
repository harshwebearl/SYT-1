const express = require("express");
const router = express.Router();
const bulkController = require("../controllers/Bulk.Controller");
const BulkController = new bulkController();

router.post("/email", (req, res) => BulkController.sendBulkEmails(req, res));
router.post("/sms", (req, res) => BulkController.sendBulkSMSs(req, res));
router.post("/notification", (req, res) => BulkController.sendBulkNotifications(req, res));

module.exports = router;
