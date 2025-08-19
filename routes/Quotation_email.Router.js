const express = require("express");
const router = express.Router();
const Quotation_email_Controller = require("../controllers/Quotation_email.Controller");
const quotation_email_controller = new Quotation_email_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");
router.post("/", adminUserAuth, (req, res) => quotation_email_controller.add_quotation_email(req, res));

router.get("/", adminUserAuth, (req, res) => quotation_email_controller.display_quotation_email(req, res));

router.get("/all", adminUserAuth, (req, res) => quotation_email_controller.display_all_quotation_email(req, res));

router.put("/", adminUserAuth, (req, res) => quotation_email_controller.update_quotation_email(req, res));

router.delete("/delete", adminUserAuth, (req, res) => quotation_email_controller.delete_quotation_email(req, res));

module.exports = router;
