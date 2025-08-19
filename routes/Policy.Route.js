const express = require("express");
const router = express.Router();
const PolicyController = require("../controllers/Policy.Controller");
const policyController = new PolicyController();

const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");

router.post("/", (req, res) => policyController.Addpolicy(req, res));

router.post("/termandcondition", (req, res) => policyController.Add_term_and_condition(req, res));

router.put("/termandcondition", (req, res) => policyController.updatePolicy(req, res));

router.get("/", (req, res) => policyController.getPolicy(req, res));

module.exports = router;
