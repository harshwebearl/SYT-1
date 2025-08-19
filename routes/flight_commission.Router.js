const express = require("express");
const router = express.Router();
const flight_commission_Controller = require("../controllers/flight_commission.Controller");
const flight_commission_controller = new flight_commission_Controller();
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");

//user registration
router.post("/", adminUserAuth, (req, res) => flight_commission_controller.add_flight_commission(req, res));

// router.post("/checkmobilenumber", (req, res) => userController.checkmobile_number(req, res));

//display user data
router.get("/", adminUserAuth, (req, res) => flight_commission_controller.display_flight_commission(req, res));

router.get("/all", (req, res) => flight_commission_controller.display_all_flight_commission(req, res));

router.put("/", (req, res) => flight_commission_controller.update_flight_commission(req, res));

// //delete user
router.delete("/:id", (req, res) => flight_commission_controller.delete_flight_commission(req, res));

module.exports = router;
