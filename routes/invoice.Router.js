const express = require("express");
const router = express.Router();
const Invoice_Controller = require("../controllers/invoice.controller");
const invoice_Controller = new Invoice_Controller();

router.post("/", (req, res) => invoice_Controller.add_invoice(req, res));

router.get("/all", (req, res) => invoice_Controller.display_all_invoice(req, res));

router.get("/", (req, res) => invoice_Controller.display_invoice(req, res));

router.put("/", (req, res) => invoice_Controller.update_invoice(req, res));

router.put("/partialpayment", (req, res) => invoice_Controller.partialpayment(req, res));

router.post("/generateinvoice", (req, res) => invoice_Controller.generateinvoice(req, res));

router.put("/status", (req, res) => invoice_Controller.update_invoice_status(req, res));

router.delete("/delete", (req, res) => invoice_Controller.delete_invoice(req, res));

module.exports = router;
