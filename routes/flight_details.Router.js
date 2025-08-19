const express = require("express");
const router = express.Router();
const flight_details_Controller = require("../controllers/flight_details.Controller");
const flight_details_controller = new flight_details_Controller();
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");

//user registration
router.post("/", adminUserAuth, (req, res) => flight_details_controller.add_flight_detail(req, res));

// router.post("/checkmobilenumber", (req, res) => userController.checkmobile_number(req, res));

//display user data
router.get("/", adminUserAuth, (req, res) => flight_details_controller.display_flight_detail(req, res));

router.get("/all", (req, res) => flight_details_controller.display_all_flight_detail(req, res));

router.put("/", (req, res) => flight_details_controller.update_flight_detail(req, res));

// //delete user
router.delete("/:id", (req, res) => flight_details_controller.delete_flight_detail(req, res));

module.exports = router;
