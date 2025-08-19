const express = require("express");
const router = express.Router();
const invoice_tax_Controller = require("../controllers/invoice_tax_Controller");
const invoice_tax_controller = new invoice_tax_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => invoice_tax_controller.add_invoice_tax(req, res));

router.get("/all", adminUserAuth, (req, res) => invoice_tax_controller.display_all_invoice_tax(req, res));

router.get("/", adminUserAuth, (req, res) => invoice_tax_controller.display_invoice_tax(req, res));

router.put("/", adminUserAuth, (req, res) => invoice_tax_controller.update_invoice_tax(req, res));

router.delete("/delete", adminUserAuth, (req, res) => invoice_tax_controller.delete_invoice_tax(req, res));

module.exports = router;
