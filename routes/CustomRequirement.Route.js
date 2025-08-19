const express = require("express");
const router = express.Router();
const customerRequirement = require("../controllers/CustomRequirement.Controller");
const CustomRequirement = new customerRequirement();
const adminUserAuth = require("../middleware/admin-user-auth");

const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");

// Add CustomRequirement
router.post("/", (req, res) => CustomRequirement.AddRequirements(req, res));

// Get CustomRequirement
router.get("/", adminUserAuth, (req, res) => CustomRequirement.getRequirment(req, res));

// Update CustomRequirement
router.put("/", adminUserAuth, (req, res) => CustomRequirement.UpdateRequirements(req, res));

// Get CustomRequirement [Admin]
router.get("/Adminshowdata", adminUserAuth, (req, res) => CustomRequirement.showreqiurementpackageAdmin(req, res));

// Get CustomRequirement [Agency]
router.get("/Agencyshowdata", adminUserAuth, (req, res) => CustomRequirement.Agencyshowrequirements(req, res));

// Delete CustomRequirement
router.delete("/", adminUserAuth, (req, res) => CustomRequirement.DeleteCustompackage(req, res));

router.get("/details", adminUserAuth, (req, res) => CustomRequirement.getCustomRequirementById_agency(req, res));

module.exports = router;
