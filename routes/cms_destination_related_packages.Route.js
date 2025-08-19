const express = require("express");
const router = express.Router();
const cms_destination_related_packages_Controller = require("../controllers/cms_destination_related_packages.Controller");
const cms_destination_related_packages_controller = new cms_destination_related_packages_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) =>
  cms_destination_related_packages_controller.add_cms_destination_related_packages(req, res)
);

router.get("/", adminUserAuth, (req, res) =>
  cms_destination_related_packages_controller.display_cms_destination_related_packages(req, res)
);

router.get("/all", adminUserAuth, (req, res) =>
  cms_destination_related_packages_controller.display_all_cms_destination_related_packages(req, res)
);

router.put("/", adminUserAuth, (req, res) =>
  cms_destination_related_packages_controller.update_cms_destination_related_packages(req, res)
);

router.delete("/delete", adminUserAuth, (req, res) =>
  cms_destination_related_packages_controller.delete_cms_destination_related_packages(req, res)
);

module.exports = router;
