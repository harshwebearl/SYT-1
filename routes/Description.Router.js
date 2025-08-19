const express = require("express");
const router = express.Router();
const Descriptioncontroller = require("../controllers/Description.Controller");
const DescriptionController = new Descriptioncontroller();

// Update Description
router.put("/", (req, res) => DescriptionController.updateDescription(req, res));

module.exports = router;
