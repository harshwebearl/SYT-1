const express = require("express");
const router = express.Router();
const meal_plan_Controller = require("../controllers/meal_plan.Controller");
const meal_plan_controller = new meal_plan_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => meal_plan_controller.add_meal_plan(req, res));

router.get("/all", adminUserAuth, (req, res) => meal_plan_controller.display_all_meal_plan(req, res));

router.get("/", adminUserAuth, (req, res) => meal_plan_controller.display_meal_plan(req, res));

router.put("/", adminUserAuth, (req, res) => meal_plan_controller.update_meal_plan(req, res));

router.delete("/delete", adminUserAuth, (req, res) => meal_plan_controller.delete_meal_plan(req, res));

module.exports = router;
