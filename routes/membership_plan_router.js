const express = require('express');
const router = express.Router();
const plan_controller = require('../controllers/membership_plan_controller');
const plan_valueController = new plan_controller();
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => plan_valueController.add_plan(req, res));

router.get("/", (req, res) => plan_valueController.display_plan(req, res));

router.get("/displayplan", (req, res) => plan_valueController.display_plan_with_id(req, res));

router.put("/", adminUserAuth, (req, res) => plan_valueController.update_plan(req, res));

router.post("/addnew", adminUserAuth, (req, res) => plan_valueController.newdata(req, res));


router.put("/changestatus", adminUserAuth, (req, res) => plan_valueController.update_membership_feature_status(req, res));


router.delete("/delete", adminUserAuth, (req, res) => plan_valueController.delete_membership_plan(req, res));
router.get("/getall", adminUserAuth, (req, res) => plan_valueController.getAllData(req, res));

// DELETE http://localhost:4000/delete?plan_id=YOUR_PLAN_ID_HERE


module.exports = router;
