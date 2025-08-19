const express = require("express");
const router = express.Router();
const sub_role_Controller = require("../controllers/sub_roleController");
const sub_role_controller = new sub_role_Controller();
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => sub_role_controller.add_sub_role(req, res));

router.get("/all", adminUserAuth, (req, res) => sub_role_controller.display_all_sub_role(req, res));

router.get("/", adminUserAuth, (req, res) => sub_role_controller.display_sub_role(req, res));

router.put("/", adminUserAuth, (req, res) => sub_role_controller.update_subrole(req, res));

router.delete("/delete", adminUserAuth, (req, res) => sub_role_controller.delete_sub_role(req, res));

module.exports = router;
