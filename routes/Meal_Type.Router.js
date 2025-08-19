const express = require("express");
const router = express.Router();
const mealTypeController = require("../controllers/Meal_Type.Controller");
const MealTypeController = new mealTypeController();
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");

router.post("/", adminUserAuth, (req, res) => MealTypeController.AddMealType(req, res));

router.get("/", (req, res) => MealTypeController.DisplayMealType(req, res));

router.put("/", adminUserAuth, (req, res) => MealTypeController.UpdateMealType(req, res));

router.delete("/", adminUserAuth, (req, res) => MealTypeController.deleteMealType(req, res));

module.exports = router;
