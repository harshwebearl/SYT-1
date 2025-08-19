const express = require("express");
const router = express.Router();
const subscribe_syt_controller = require("../controllers/Subscribe_Syt_Controller");
const subscribe_syt_class = new subscribe_syt_controller();
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", (req, res) => subscribe_syt_class.add_subscribe_syt(req, res));

router.get("/", (req, res) => subscribe_syt_class.view_subscribe_syt(req, res));

module.exports = router;
