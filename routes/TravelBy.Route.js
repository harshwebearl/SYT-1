const express = require("express");
const router = express.Router();
const travelByController = require("../controllers/TravelBy.Controller");
const TravelByController = new travelByController();

const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");

router.post("/", (req, res) => TravelByController.addVehicle(req, res));

router.get("/", (req, res) => TravelByController.getVehicle(req, res));

router.put("/", (req, res) => TravelByController.updateVehicle(req, res));

router.delete("/", (req, res) => TravelByController.deleteVehicle(req, res));

module.exports = router;
