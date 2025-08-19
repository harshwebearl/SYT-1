const express = require("express");
const router = express.Router();
const service_2_Controller = require("../controllers/service_2_Controller");
const service_2_controller = new service_2_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => service_2_controller.add_service_2(req, res));

router.get("/", adminUserAuth, (req, res) => service_2_controller.display_service_2(req, res));

router.get("/all", adminUserAuth, (req, res) => service_2_controller.display_all_service_2(req, res));

router.put("/", adminUserAuth, (req, res) => service_2_controller.update_service_2(req, res));

router.delete("/delete", adminUserAuth, (req, res) => service_2_controller.delete_service_2(req, res));

module.exports = router;
