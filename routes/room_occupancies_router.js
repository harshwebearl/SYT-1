const express = require("express");
const router = express.Router();
const room_occupancies_Controller = require("../controllers/room_occupancies.Controller");
const room_occupancies_controller = new room_occupancies_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => room_occupancies_controller.add_room_occupancies(req, res));

router.get("/", adminUserAuth, (req, res) => room_occupancies_controller.display_room_occupancies(req, res));

router.get("/all", adminUserAuth, (req, res) => room_occupancies_controller.display_all_room_occupancies(req, res));

router.put("/", adminUserAuth, (req, res) => room_occupancies_controller.update_room_occupancies(req, res));

router.delete("/delete", adminUserAuth, (req, res) => room_occupancies_controller.delete_room_occupancies(req, res));

module.exports = router;
