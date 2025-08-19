const express = require("express");
const router = express.Router();
const cms_website_setting_Controller = require("../controllers/cms_website_setting.Controller");
const cms_website_setting_controller = new cms_website_setting_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => cms_website_setting_controller.add_cms_website_setting(req, res));

router.get("/", adminUserAuth, (req, res) => cms_website_setting_controller.display_cms_website_setting(req, res));

router.get("/all", adminUserAuth, (req, res) =>
  cms_website_setting_controller.display_all_cms_website_setting(req, res)
);

router.put("/", adminUserAuth, (req, res) => cms_website_setting_controller.update_cms_website_setting(req, res));

router.delete("/delete", adminUserAuth, (req, res) =>
  cms_website_setting_controller.delete_cms_website_setting(req, res)
);

module.exports = router;
