const express = require("express");
const router = express.Router();
const Location_Controller = require("../controllers/location.Controller");
const location_Controller = new Location_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => location_Controller.add_location(req, res));

router.get("/all", adminUserAuth, (req, res) => location_Controller.display_all_location(req, res));

router.get("/", adminUserAuth, (req, res) => location_Controller.display_location(req, res));

router.put("/", adminUserAuth, (req, res) => location_Controller.update_location(req, res));

router.delete("/delete", adminUserAuth, (req, res) => location_Controller.delete_location(req, res));

module.exports = router;
