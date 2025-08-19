const express = require("express");
const router = express.Router();
const flight_Controller = require("../controllers/flight.Controller");
const flight_controller = new flight_Controller();
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");

//user registration
router.post("/", adminUserAuth, (req, res) => flight_controller.add_flight(req, res));

// router.post("/checkmobilenumber", (req, res) => userController.checkmobile_number(req, res));

//display user data
router.get("/", adminUserAuth, (req, res) => flight_controller.display_flight(req, res));

router.get("/all", (req, res) => flight_controller.display_all_flight(req, res));

router.put("/", (req, res) => flight_controller.update_flight(req, res));

// //delete user
router.delete("/:id", (req, res) => flight_controller.delete_flight(req, res));

module.exports = router;
