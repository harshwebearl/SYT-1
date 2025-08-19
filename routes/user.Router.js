const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const user_controller = new userController();

router.post("/loginAll", (req, res) => user_controller.loginAll(req, res));

module.exports = router;
