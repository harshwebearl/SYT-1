const express = require("express");
const router = express.Router();
const pkg_hotel_type_Controller = require("../controllers/pkg_hotel_typeController");
const pkg_hotel_type_controller = new pkg_hotel_type_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => pkg_hotel_type_controller.add_hotel_type(req, res));

router.get("/all", adminUserAuth, (req, res) => pkg_hotel_type_controller.display_all_hotel_type(req, res));

router.get("/", adminUserAuth, (req, res) => pkg_hotel_type_controller.display_hotel_type(req, res));

router.put("/", adminUserAuth, (req, res) => pkg_hotel_type_controller.update_hotel_type(req, res));

router.delete("/delete", adminUserAuth, (req, res) => pkg_hotel_type_controller.delete_hotel_type(req, res));

module.exports = router;
