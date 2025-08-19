const express = require("express");
const router = express.Router();
const cms_setting_seo_Controller = require("../controllers/cms_settings_seo.Controller");
const cms_setting_seo_controller = new cms_setting_seo_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => cms_setting_seo_controller.add_cms_setting_seo(req, res));

router.get("/", adminUserAuth, (req, res) => cms_setting_seo_controller.display_cms_setting_seo(req, res));

router.get("/all", adminUserAuth, (req, res) => cms_setting_seo_controller.display_all_cms_setting_seo(req, res));

router.put("/", adminUserAuth, (req, res) => cms_setting_seo_controller.update_cms_setting_seo(req, res));

router.delete("/delete", adminUserAuth, (req, res) => cms_setting_seo_controller.delete_cms_setting_seo(req, res));

module.exports = router;
