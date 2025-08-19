const express = require("express");
const router = express.Router();
const bulk_followup_Controller = require("../controllers/bulk_followup.Controller");
const bulk_followup_controller = new bulk_followup_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => bulk_followup_controller.add_bulk_followup(req, res));

router.get("/", adminUserAuth, (req, res) => bulk_followup_controller.display_bulk_followup(req, res));

router.get("/all", adminUserAuth, (req, res) => bulk_followup_controller.display_all_bulk_followup(req, res));

router.put("/", adminUserAuth, (req, res) => bulk_followup_controller.update_bulk_followup(req, res));

router.delete("/delete", adminUserAuth, (req, res) => bulk_followup_controller.delete_bulk_followup(req, res));

module.exports = router;
