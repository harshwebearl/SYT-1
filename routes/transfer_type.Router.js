const express = require("express");
const router = express.Router();
const transfer_type_Controller = require("../controllers/transfer_type.Controller");
const transfer_type_controller = new transfer_type_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => transfer_type_controller.add_transfer_type(req, res));

router.get("/", adminUserAuth, (req, res) => transfer_type_controller.display_transfer_type(req, res));

router.get("/all", adminUserAuth, (req, res) => transfer_type_controller.display_all_transfer_type(req, res));

router.put("/", adminUserAuth, (req, res) => transfer_type_controller.update_transfer_type(req, res));

router.delete("/delete", adminUserAuth, (req, res) => transfer_type_controller.delete_transfer_type(req, res));

module.exports = router;
