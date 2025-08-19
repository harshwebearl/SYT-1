const express = require("express");
const router = express.Router();
const setting_payment_gateway_Controller = require("../controllers/setting_payment_gateway.Controller");
const setting_payment_gateway_controller = new setting_payment_gateway_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => setting_payment_gateway_controller.add_setting_payment_gateway(req, res));

router.get("/", adminUserAuth, (req, res) =>
  setting_payment_gateway_controller.display_setting_payment_gateway(req, res)
);

router.get("/all", adminUserAuth, (req, res) =>
  setting_payment_gateway_controller.display_all_setting_payment_gateway(req, res)
);

router.put("/", adminUserAuth, (req, res) =>
  setting_payment_gateway_controller.update_setting_payment_gateway(req, res)
);

router.delete("/delete", adminUserAuth, (req, res) =>
  setting_payment_gateway_controller.delete_setting_payment_gateway(req, res)
);

module.exports = router;
