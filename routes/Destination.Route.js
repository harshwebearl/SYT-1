const express = require("express");
const router = express.Router();
const destinationnameController = require("../controllers/Destination.Controller");
const DestinationController = new destinationnameController();

router.post("/", (req, res) => DestinationController.RegisterDestination(req, res));

router.get("/", (req, res) => DestinationController.getDestinationData(req, res));

router.get("/alldestination", (req, res) => DestinationController.display_Destination(req, res));

router.get("/getDestinationData", (req, res) => DestinationController.GetDestination(req, res));

router.get("/getDestinations", (req, res) => DestinationController.DestinationPhoto(req, res));

router.put("/:id", (req, res) => DestinationController.updateDestinationCategory(req, res));

router.delete("/:id", (req, res) => DestinationController.DeleteDestination(req, res));

router.get("/mostloveddestionation", (req, res) => DestinationController.Displaymostloveddestination(req, res));

module.exports = router;
