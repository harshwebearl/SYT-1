const express = require("express");
const router = express.Router();
const customer_group_Controller = require("../controllers/customer_group_Controller");
const customer_group_controller = new customer_group_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => customer_group_controller.add_customer_group(req, res));

router.get("/", adminUserAuth, (req, res) => customer_group_controller.display_customer_group(req, res));

router.get("/all", adminUserAuth, (req, res) => customer_group_controller.display_all_customer_group(req, res));

router.put("/", adminUserAuth, (req, res) => customer_group_controller.update_customer_group(req, res));

router.delete("/delete", adminUserAuth, (req, res) => customer_group_controller.delete_customer_group(req, res));

module.exports = router;
