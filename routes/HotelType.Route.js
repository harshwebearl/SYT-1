const express = require("express");
const router = express.Router();
const hotelTypeController = require("../controllers/HotelType.Controller");
const HotelTypeController = new hotelTypeController();

const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => HotelTypeController.createHotel(req, res));

router.get("/", adminUserAuth, (req, res) => HotelTypeController.getHotels(req, res));

router.put("/", adminUserAuth, (req, res) => HotelTypeController.updateHotel(req, res));

router.delete("/", adminUserAuth, (req, res) => HotelTypeController.deleteHotel(req, res));

module.exports = router;
