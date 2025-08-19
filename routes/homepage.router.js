const express = require("express");
const router = express.Router();
const HomepageController = require("../controllers/homepage.controller");
const homepagecontroller = new HomepageController();

router.get("/", (req, res) => homepagecontroller.Show_homepage_Data(req, res));
router.get("/ai", (req, res) => homepagecontroller.travel_ai_dashboard(req, res));
router.get("/new_syt", (req, res) => homepagecontroller.new_syt_desing_dashboard(req, res));

module.exports = router;
