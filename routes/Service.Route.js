const express = require("express");
const router = express.Router();
const ServiceController = require("../controllers/Service.Controller");
const serviceController = new ServiceController();
const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

//add services
router.post("/", adminUserAuth, (req, res) => serviceController.addService(req, res));

//display service from super admin
router.get("/getallservices", (req, res) => serviceController.getAllService(req, res));

//display services
router.get("/", (req, res) => serviceController.getService(req, res));

//update service
router.put("/", adminUserAuth, (req, res) => serviceController.updateService(req, res));

//delete Servie
router.delete("/:id", adminUserAuth, (req, res) => serviceController.deleteService(req, res));

module.exports = router;
