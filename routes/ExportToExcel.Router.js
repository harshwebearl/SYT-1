const express = require("express");
const router = express.Router();
const exportToExcelController = require("../controllers/Export_to_Excel.Controller");
const ExportToExcelController = new exportToExcelController();
const { uploadFile } = require("../middleware/genericMulter.js");
// const isAuthAllowed = require("../middleware/isAuthAllowed");

router.get("/", (req, res, next) => ExportToExcelController.generateExcelFile(req, res, next));

router.get("/1", (req, res, next) => ExportToExcelController.exportEmployees(req, res, next));

module.exports = router;
