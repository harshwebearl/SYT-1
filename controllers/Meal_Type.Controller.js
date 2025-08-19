const { errorMonitor } = require("nodemailer/lib/xoauth2");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const MealTypeSchema = require("../models/Meal_TypeSchema");
const BaseController = require("./BaseController");
const userSchema = require("../models/usersSchema");
module.exports = class MealTypeController extends BaseController {
  async AddMealType(req, res) {
    try {
      // const tokenData = req.userData;
      // if (tokenData.type !== "admin") {
      //   throw new Forbidden("you can not add vehicle");
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
      const insertMealType = new MealTypeSchema(data);
      const mealtype = await insertMealType.save();

      return this.sendJSONResponse(
        res,
        "Meal_Type added",
        {
          length: 1
        },
        mealtype
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async DisplayMealType(req, res) {
    try {
      const DisplayMealType = await MealTypeSchema.find();
      return this.sendJSONResponse(
        res,
        " Display MealType ",
        {
          length: 1
        },
        DisplayMealType
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async UpdateMealType(req, res) {
    try {
      const MealType_id = req.query.MealType_id;
      // const tokenData = req.userData;
      // if (tokenData.type !== "admin") {
      //   throw new Forbidden("you can not update vehicle");
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
      const UpdateMealType = await MealTypeSchema.findByIdAndUpdate({ _id: MealType_id }, data);

      return this.sendJSONResponse(
        res,
        "MealType data updated",
        {
          length: 1
        },
        "MealType data updated"
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async deleteMealType(req, res) {
    try {
      const MealType_id = req.query.MealType_id;
      // const tokenData = req.userData;
      // if (tokenData.type !== "admin") {
      //   throw new Forbidden("you can not update vehicle");
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

      const updatedData = await MealTypeSchema.findByIdAndDelete({ _id: MealType_id });

      return this.sendJSONResponse(
        res,
        "vehicle data updated",
        {
          length: 1
        },
        "vehicle data updated"
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
