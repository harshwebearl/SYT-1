const express = require("express");
const router = express.Router();
const dynamic_discounting_Controller = require("../controllers/dynamic_discounting.Controller");
const dynamic_discounting_controller = new dynamic_discounting_Controller();
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");

//user registration
router.post("/", adminUserAuth, (req, res) => dynamic_discounting_controller.add_dynamic_discounting(req, res));

// router.post("/checkmobilenumber", (req, res) => userController.checkmobile_number(req, res));

// //display user data
router.get("/", adminUserAuth, (req, res) => dynamic_discounting_controller.display_dynamic_discounting(req, res));

router.get("/all", (req, res) => dynamic_discounting_controller.display_all_dynamic_discounting(req, res));

router.put("/", (req, res) => dynamic_discounting_controller.update_dynamic_discounting(req, res));

// //delete user
router.delete("/:id", (req, res) => dynamic_discounting_controller.delete_dynamic_discounting(req, res));

module.exports = router;
