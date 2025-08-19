const express = require("express");
const router = express.Router();
const about_controller = require("../controllers/about_controller");
const about_class = new about_controller();

// router.post("/", (req, res) => about_class.add_about(req, res));
router.get("/", (req, res) => about_class.get_about(req, res));
router.put("/", (req, res) => about_class.update_about(req, res));

module.exports = router;
