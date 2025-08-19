const express = require("express");
const router = express.Router();
const room_type_Controller = require("../controllers/room_type.Controller");
const room_type_controller = new room_type_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => room_type_controller.add_branches(req, res));

router.get("/", adminUserAuth, (req, res) => room_type_controller.display_room_type(req, res));

router.get("/all", adminUserAuth, (req, res) => room_type_controller.display_all_room_type(req, res));

router.put("/", adminUserAuth, (req, res) => room_type_controller.update_room_type(req, res));

router.delete("/delete", adminUserAuth, (req, res) => room_type_controller.delete_room_type(req, res));

module.exports = router;
