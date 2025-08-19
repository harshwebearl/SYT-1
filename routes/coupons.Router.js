const express = require("express");
const router = express.Router();
const coupon_Controller = require("../controllers/coupons.Controller");
const coupon_controller = new coupon_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => coupon_controller.add_coupons(req, res));

router.get("/", adminUserAuth, (req, res) => coupon_controller.display_coupons(req, res));

router.get("/all", adminUserAuth, (req, res) => coupon_controller.display_all_coupons(req, res));

router.put("/", adminUserAuth, (req, res) => coupon_controller.update_coupons(req, res));

router.delete("/delete", adminUserAuth, (req, res) => coupon_controller.delete_coupons(req, res));

module.exports = router;
