const express = require("express");
const router = express.Router();
const lead_booking_Controller = require("../controllers/lead_booking.Controller");
const lead_booking_controller = new lead_booking_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => lead_booking_controller.add_lead_booking(req, res));

router.get("/all", adminUserAuth, (req, res) => lead_booking_controller.display_all_lead_booking(req, res));

router.get("/", adminUserAuth, (req, res) => lead_booking_controller.display_lead_booking(req, res));

router.put("/", adminUserAuth, (req, res) => lead_booking_controller.update_lead_booking(req, res));

router.delete("/delete", adminUserAuth, (req, res) => lead_booking_controller.delete_lead_booking(req, res));

module.exports = router;
