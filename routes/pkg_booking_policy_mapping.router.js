const express = require("express");
const router = express.Router();
const pkg_booking_policy_mapping = require("../controllers/pkg_booking_policy_mapping.controller");
const pkg_booking_policy_Mapping = new pkg_booking_policy_mapping();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => pkg_booking_policy_Mapping.add_document_type(req, res));

router.get("/", adminUserAuth, (req, res) => pkg_booking_policy_Mapping.display_document_type(req, res));

router.get("/all", adminUserAuth, (req, res) => pkg_booking_policy_Mapping.display_all_document_type(req, res));

router.put("/", adminUserAuth, (req, res) => pkg_booking_policy_Mapping.update_document_type(req, res));

router.delete("/delete", adminUserAuth, (req, res) => pkg_booking_policy_Mapping.delete_document_type(req, res));

module.exports = router;
