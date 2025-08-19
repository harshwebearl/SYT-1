const express = require("express");
const router = express.Router();
const cms_special_package_Controller = require("../controllers/cms_special_package.Controller");
const cms_special_package_controller = new cms_special_package_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => cms_special_package_controller.add_cms_special_packages(req, res));

router.get("/", adminUserAuth, (req, res) => cms_special_package_controller.display_cms_special_packages(req, res));

router.get("/all", adminUserAuth, (req, res) =>
  cms_special_package_controller.display_all_cms_special_packages(req, res)
);

router.put("/", adminUserAuth, (req, res) => cms_special_package_controller.update_cms_special_packages(req, res));

router.delete("/delete", adminUserAuth, (req, res) =>
  cms_special_package_controller.delete_cms_special_packages(req, res)
);

module.exports = router;
