const express = require("express");
const res = require("express/lib/response");
const router = express.Router();
const visa_on_arrival_Controller = require("../controllers/visa_on_arrival.Controller");
const visa_on_arrivalController = new visa_on_arrival_Controller();

router.post("/", (req, res) => visa_on_arrivalController.AddTransactonData(req, res));

module.exports = router;