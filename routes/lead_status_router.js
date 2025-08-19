const express = require("express");
const router = express.Router();
const Lead_status_Controller = require("../controllers/lead_status_controller");
const Lead_Status_Controller = new Lead_status_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => Lead_Status_Controller.add_lead_status(req, res));

router.get("/all", adminUserAuth, (req, res) => Lead_Status_Controller.display_all_lead_status(req, res));

router.get("/", adminUserAuth, (req, res) => Lead_Status_Controller.display_lead_status(req, res));

router.put("/", adminUserAuth, (req, res) => Lead_Status_Controller.update_lead_status(req, res));

router.delete("/delete", adminUserAuth, (req, res) => Lead_Status_Controller.delete_lead_status(req, res));

module.exports = router;
