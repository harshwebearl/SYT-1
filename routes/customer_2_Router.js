const express = require("express");
const router = express.Router();
const customer_2_Controller = require("../controllers/customer_2_Controller");
const customer_2_controller = new customer_2_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");
const multerMiddleware = require("../middleware/sytmulter.js");
router.post("/", adminUserAuth, (req, res) => customer_2_controller.add_customer_2(req, res));

router.get("/", adminUserAuth, (req, res) => customer_2_controller.display_customer_2(req, res));

router.get("/all", adminUserAuth, (req, res) => customer_2_controller.display_all_customer_2(req, res));

router.put("/", adminUserAuth, (req, res) => customer_2_controller.update_customer_2(req, res));

router.delete("/delete", adminUserAuth, (req, res) => customer_2_controller.delete_customer_2(req, res));

module.exports = router;
