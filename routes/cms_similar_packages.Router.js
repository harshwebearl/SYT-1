const express = require("express");
const router = express.Router();
const cms_similar_packages_Controller = require("../controllers/cms_similar_packages.Controller");
const cms_similar_packages_controller = new cms_similar_packages_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => cms_similar_packages_controller.add_cms_similar_packages(req, res));

router.get("/", adminUserAuth, (req, res) => cms_similar_packages_controller.display_cms_similar_packages(req, res));

router.get("/all", adminUserAuth, (req, res) =>
  cms_similar_packages_controller.display_all_cms_similar_packages(req, res)
);

router.put("/", adminUserAuth, (req, res) => cms_similar_packages_controller.update_cms_similar_packages(req, res));

router.delete("/delete", adminUserAuth, (req, res) =>
  cms_similar_packages_controller.delete_cms_similar_packages(req, res)
);

module.exports = router;
