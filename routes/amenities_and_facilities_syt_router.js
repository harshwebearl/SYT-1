const express = require("express");
const router = express.Router();
const amenities_controller = require("../controllers/amenities_and_facilities_syt_controller");

// const auth = require("../middleware/auth");
const amenities_and_facilities_class = new amenities_controller();

router.post("/", (req, res) => amenities_and_facilities_class.add_amenities_and_facilities(req, res));
router.get("/", (req, res) => amenities_and_facilities_class.get_amenities_and_facilities(req, res));
router.get("/byhotelid", (req, res) =>
  amenities_and_facilities_class.get_amenities_and_facilities_by_hotelid(req, res)
);
router.get("/byid", (req, res) => amenities_and_facilities_class.get_amenities_and_facilities_by_id(req, res));
router.put("/", (req, res) => amenities_and_facilities_class.update_amenities_and_facilities(req, res));
router.delete("/", (req, res) => amenities_and_facilities_class.delete_amenities_and_facilities(req, res));

module.exports = router;
