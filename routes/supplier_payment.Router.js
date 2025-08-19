const express = require("express");
const router = express.Router();
const suppliers_payment_Controller = require("../controllers/supplier_payment.Controller");
const suppliers_payment_controller = new suppliers_payment_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => suppliers_payment_controller.add_supplier_payment(req, res));

router.get("/", adminUserAuth, (req, res) => suppliers_payment_controller.display_supplier_payment(req, res));

router.get("/all", adminUserAuth, (req, res) => suppliers_payment_controller.display_all_supplier_payment(req, res));

router.put("/", adminUserAuth, (req, res) => suppliers_payment_controller.update_supplier_payment(req, res));

router.delete("/delete", adminUserAuth, (req, res) => suppliers_payment_controller.delete_supplier_payment(req, res));

module.exports = router;
