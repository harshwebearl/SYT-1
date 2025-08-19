const express = require("express");
const router = express.Router();
const business_type_controller = require("../controllers/business_type_controller");

const business_type_class = new business_type_controller();

router.post("/", (req, res) => business_type_class.add_business_type(req, res));
router.get("/", (req, res) => business_type_class.get_business_type(req, res));

module.exports = router;
