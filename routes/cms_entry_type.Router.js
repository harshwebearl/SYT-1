const express = require("express");
const router = express.Router();
const cms_entry_type_Controller = require("../controllers/cms_entry_type.Controller");
const cms_entry_type_controller = new cms_entry_type_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => cms_entry_type_controller.add_cms_entry_type(req, res));

router.get("/", adminUserAuth, (req, res) => cms_entry_type_controller.display_cms_entry_type(req, res));

router.get("/all", adminUserAuth, (req, res) => cms_entry_type_controller.display_all_cms_entry_type(req, res));

router.put("/", adminUserAuth, (req, res) => cms_entry_type_controller.update_cms_entry_type(req, res));

router.delete("/delete", adminUserAuth, (req, res) => cms_entry_type_controller.delete_cms_entry_type(req, res));

module.exports = router;
