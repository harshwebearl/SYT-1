const NotFound = require("../errors/NotFound");
const mealSchema = require("../models/MealSchema");
const BaseController = require("./BaseController");
const userSchema = require("../models/usersSchema");

module.exports = class MealController extends BaseController {
  async addMeal(req, res) {
    try {
      // const tokenData = req.userData;

      // if (tokenData.type !== "admin") {
      //   throw new Forbidden("you can not deleted hotel");
      // }

      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData);
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const data = {
        name: req.body.name
      };

      const insertedData = new mealSchema(data);
      const result = await insertedData.save();
      return this.sendJSONResponse(
        res,
        "meal added",
        {
          length: 1
        },
        "meal data inserted successfully"
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async getMeal(req, res) {
    try {
      const result = await mealSchema.find();
      return this.sendJSONResponse(
        res,
        "meal data retrived",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async updateMeal(req, res) {
    try {
      const meal_id = req.query.meal_id;
      // const tokenData = req.userData;

      // if (tokenData.type !== "admin") {
      //   throw new Forbidden("you can not deleted hotel");
      // }

      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData);
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const data = {
        name: req.body.name
      };
      const updateMeal = await mealSchema.findByIdAndUpdate({ _id: meal_id }, data);
      return this.sendJSONResponse(
        res,
        "meal updated",
        {
          length: 1
        },
        "meal data updated successfully"
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
  async deleteMeal(req, res) {
    try {
      const meal_id = req.query.meal_id;

      // const tokenData = req.userData;
      // if (tokenData.type !== "admin") {
      //   throw new Forbidden("you can not deleted hotel");
      // }
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData);
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const deleteMeal = await mealSchema.findByIdAndDelete({ _id: meal_id });
      return this.sendJSONResponse(
        res,
        "meal deleted",
        {
          length: 1
        },
        "meal data deleted successfully"
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
