const express = require("express");
const router = express.Router();
const PackageController = require("../controllers/Package.Controller");
const package = new PackageController();
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");

const isAuthAllowed = require("../middleware/isAuthAllowed");

router.post("/", adminUserAuth, (req, res) => package.AddPackages(req, res));

router.get("/", adminUserAuth, (req, res) => package.ShowPackageDetail(req, res));

router.get("/getPackageData", (req, res) => package.getPackageDetails(req, res));

router.put("/:id", adminUserAuth, (req, res) => package.UpdatePackageDetail(req, res));

router.put("/addServices/:id", adminUserAuth, (req, res) => package.AddPackageServices(req, res));

router.delete("/:id", adminUserAuth, (req, res) => package.DeletePackageData(req, res));

router.get("/getpackages", (req, res) => package.packageItinary(req, res));

router.get("/agency_package_display", (req, res) => package.display_agency_package(req, res));

module.exports = router;
