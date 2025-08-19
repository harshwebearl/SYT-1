const express = require("express");
const router = express.Router();
const mealController = require("../controllers/Meal.Controller");
const MealController = new mealController();

const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => MealController.addMeal(req, res));

router.get("/", (req, res) => MealController.getMeal(req, res));

router.put("/", adminUserAuth, (req, res) => MealController.updateMeal(req, res));

router.delete("/", adminUserAuth, (req, res) => MealController.deleteMeal(req, res));

module.exports = router;
