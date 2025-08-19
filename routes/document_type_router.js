const express = require("express");
const router = express.Router();
const document_type_Controller = require("../controllers/document_typeController");
const Document_Type_Controller = new document_type_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => Document_Type_Controller.add_document_type(req, res));

router.get("/", adminUserAuth, (req, res) => Document_Type_Controller.display_document_type(req, res));

router.get("/all", adminUserAuth, (req, res) => Document_Type_Controller.display_all_document_type(req, res));

router.put("/", adminUserAuth, (req, res) => Document_Type_Controller.update_document_type(req, res));

router.delete("/delete", adminUserAuth, (req, res) => Document_Type_Controller.delete_document_type(req, res));

module.exports = router;
