const express = require("express");
const router = express.Router();
const member_Controller = require("../controllers/member.Controller");
const member_controller = new member_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => member_controller.add_member(req, res));

router.get("/", adminUserAuth, (req, res) => member_controller.display_member(req, res));

router.get("/all", adminUserAuth, (req, res) => member_controller.display_all_member(req, res));

router.put("/", adminUserAuth, (req, res) => member_controller.update_member(req, res));

router.delete("/delete", adminUserAuth, (req, res) => member_controller.delete_member(req, res));

module.exports = router;
