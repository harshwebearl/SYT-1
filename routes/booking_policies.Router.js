const express = require("express");
const router = express.Router();
const booking_policies_Controller = require("../controllers/booking_policies.Controller");
const booking_policies_controller = new booking_policies_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => booking_policies_controller.add_booking_policies(req, res));

router.get("/", adminUserAuth, (req, res) => booking_policies_controller.display_booking_policies(req, res));

router.get("/all", adminUserAuth, (req, res) => booking_policies_controller.display_all_booking_policies(req, res));

router.put("/", adminUserAuth, (req, res) => booking_policies_controller.update_booking_policies(req, res));

router.delete("/delete", adminUserAuth, (req, res) => booking_policies_controller.delete_booking_policies(req, res));

module.exports = router;
