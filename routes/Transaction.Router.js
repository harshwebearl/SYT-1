const express = require("express");
const res = require("express/lib/response");
const router = express.Router();
const transactionController = require("../controllers/Transaction.Controller");
const TransactionController = new transactionController();
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");
const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");

router.post("/", (req, res) => TransactionController.AddTransactonData(req, res));

router.get("/", (req, res) => TransactionController.DisplayUserTransactions(req, res));

router.get("/agency", (req, res) => TransactionController.AgencyDisplayUserTransection(req, res));

router.put("/update", (req, res) => TransactionController.updateTransactionData(req, res));

router.delete("/delete", (req, res) => TransactionController.DeleteTransactionData(req, res));

module.exports = router;
