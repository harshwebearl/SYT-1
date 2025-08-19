const express = require("express");
const router = express.Router();
const suppliers_Controller = require("../controllers/suppliers.Controller");
const suppliers_controller = new suppliers_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => suppliers_controller.add_suppliers(req, res));

router.get("/", adminUserAuth, (req, res) => suppliers_controller.display_suppliers(req, res));

router.get("/all", adminUserAuth, (req, res) => suppliers_controller.display_all_suppliers(req, res));

router.put("/", adminUserAuth, (req, res) => suppliers_controller.update_suppliers(req, res));

router.delete("/delete", adminUserAuth, (req, res) => suppliers_controller.delete_suppliers(req, res));

module.exports = router;
