const BaseController = require("./BaseController");
const meal_plan_schema = require("../models/meal_plan_schema");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const mongoose = require("mongoose");

module.exports = class meal_plan_Controller extends BaseController {
  async add_meal_plan(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      const data = {
        agency_id: tokenData.id,
        name: req.body.name
      };
      const add_meal_plan = new meal_plan_schema(data);
      const Add_meal_plan = await add_meal_plan.save();
      return this.sendJSONResponse(
        res,
        "leads status add",
        {
          length: 1
        },
        Add_meal_plan
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_meal_plan(req, res) {
    try {
      const _id = req.query._id;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      const display_meal_plan = await meal_plan_schema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display meal_plan",
        {
          length: 1
        },
        display_meal_plan
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_meal_plan(req, res) {
    try {
      const is_deleted = req.query.is_deleted;
      //  console.log(is_deleted);
      //  console.log(is_deleted=== "true")
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      // let { limit, page, is_deleted } = req.query;
      // if ([null, undefined, ""].includes(page)) {
      //   page = 1;
      // }
      // if ([null, undefined, "", 1].includes(limit)) {
      //   limit = 50;
      // }
      // const option = {
      //   limit: limit,
      //   page: page
      // };

      // let productPaginate1;
      // let Data = [];
      let result;
      if (is_deleted === "true") {
        // console.log("123");
        result = await meal_plan_schema.aggregate([
          {
            $match: {
              $and: [
                { is_deleted: true }
                // { agency_id: mongoose.Types.ObjectId(tokenData.id) }
              ]
            }
          }
        ]);
        // productPaginate1 = await meal_plan_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     name: element.name,
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        // console.log("456");
        result = await meal_plan_schema.aggregate([
          {
            $match: {
              $and: [
                { is_deleted: { $ne: true } }
                // { agency_id: mongoose.Types.ObjectId(tokenData.id) }
              ]
            }
          }
        ]);
        // productPaginate1 = await meal_plan_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     status: element.status,
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      }

      // const pageInfo = {};
      // pageInfo.totalDocs = productPaginate1.totalDocs;
      // pageInfo.limit = productPaginate1.limit;
      // pageInfo.page = productPaginate1.page;
      // pageInfo.totalPages = productPaginate1.totalDocs;
      // pageInfo.pagingCounter = productPaginate1.pagingCounter;
      // pageInfo.hasPrevPage = productPaginate1.hasPrevPage;
      // pageInfo.hasNextPage = productPaginate1.hasNextPage;
      // pageInfo.prevPage = productPaginate1.prevPage;
      // pageInfo.nextPage = productPaginate1.nextPage;

      const meal_plans = {
        meal_plan: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display meal plan",
        {
          length: 1
        },
        meal_plans
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_meal_plan(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      const _id = req.query._id;

      const Data = {
        status: req.body.status,
        is_deleted: req.body.is_deleted
      };

      const update_meal_plan = await meal_plan_schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, Data, {
        new: true
      });
      return this.sendJSONResponse(
        res,
        "update leads",
        {
          length: 1
        },
        update_meal_plan
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_meal_plan(req, res) {
    try {
      const _id = req.query._id;
      console.log(_id);

      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      const data = {
        is_deleted: true
      };

      const delete_meal_plan = await meal_plan_schema.findByIdAndUpdate({ _id: _id }, data);
      console.log(delete_meal_plan);
      return this.sendJSONResponse(
        res,
        "delete meal_plan",
        {
          length: 1
        },
        delete_meal_plan
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
