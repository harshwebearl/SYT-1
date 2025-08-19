const express = require("express");
const router = express.Router();
const property_policies_controller = require("../controllers/property_policies_controller");

const property_policies_class = new property_policies_controller();

router.post("/", (req, res) => property_policies_class.add_property_policies(req, res));
router.get("/", (req, res) => property_policies_class.read_property_policies_by_property_and_policies_id(req, res));
router.get("/byhotelid", (req, res) => property_policies_class.read_property_policies_by_hotelid(req, res));
router.put("/", (req, res) => property_policies_class.update_property_policies(req, res));
router.delete("/", (req, res) => property_policies_class.delete_property_polciies(req, res));

module.exports = router;
