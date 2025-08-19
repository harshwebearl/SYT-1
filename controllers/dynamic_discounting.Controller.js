const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const dynamic_discounting_schema = require("../models/dynamic_discounting.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");

module.exports = class dynamic_discounting_Controller extends BaseController {
  async add_dynamic_discounting(req, res) {
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
        flight_types: req.body.flight_types,
        flight_from: req.body.flight_from,
        flight_to: req.body.flight_to,
        fare_types: req.body.fare_types,
        airlines: req.body.airlines,
        dynamic_discounting: {
          discount_percentage: req.body.dynamic_discounting.discount_percentage,
          from_day: req.body.dynamic_discounting.from_day,
          to_day: req.body.dynamic_discounting.to_day
        }
      };

      const add_dynamic_discounting = new dynamic_discounting_schema(data);
      const Add_dynamic_discounting = await add_dynamic_discounting.save();

      Add_dynamic_discounting.img = generateDownloadLink(Add_dynamic_discounting.img);

      return this.sendJSONResponse(
        res,
        "add dynamic_discounting ",
        {
          length: 1
        },
        Add_dynamic_discounting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_dynamic_discounting(req, res) {
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

      const display_dynamic_discounting = await dynamic_discounting_schema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display  dynamic_discounting",
        {
          length: 1
        },
        display_dynamic_discounting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_dynamic_discounting(req, res) {
    try {
      // const is_deleted = req.query.is_deleted;
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

      let { limit, pages, is_deleted } = req.query;
      if ([null, undefined, ""].includes(pages)) {
        pages = 1;
      }
      if ([null, undefined, "", 1].includes(limit)) {
        limit = 50;
      }
      const option = {
        limit: limit,
        pages: pages
      };

      let productPaginate1;
      let Data = [];
      let result;
      if (is_deleted === "true") {
        // console.log("123");
        result = await dynamic_discounting_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        productPaginate1 = await dynamic_discounting_schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            agency_id: element.id,
            _id: element._id,
            flight_types: element.flight_types,
            flight_from: element.flight_from,
            flight_to: element.flight_to,
            fare_types: element.fare_types,
            airlines: element.airlines,
            is_deleted: element.is_deleted,
            dynamic_discounting: {
              discount_percentage: element.dynamic_discounting.discount_percentage,
              from_day: element.dynamic_discounting.from_day,
              to_day: element.dynamic_discounting.to_day
            }
          });
        });
      } else {
        // console.log("456");
        result = await dynamic_discounting_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        productPaginate1 = await dynamic_discounting_schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            agency_id: element.id,
            _id: element._id,
            flight_types: element.flight_types,
            flight_from: element.flight_from,
            flight_to: element.flight_to,
            fare_types: element.fare_types,
            airlines: element.airlines,
            is_deleted: element.is_deleted,
            dynamic_discounting: {
              discount_percentage: element.dynamic_discounting.discount_percentage,
              from_day: element.dynamic_discounting.from_day,
              to_day: element.dynamic_discounting.to_day
            }
          });
        });
      }

      const pageInfo = {};
      pageInfo.totalDocs = productPaginate1.totalDocs;
      pageInfo.limit = productPaginate1.limit;
      pageInfo.page = productPaginate1.page;
      pageInfo.totalPages = productPaginate1.totalDocs;
      pageInfo.pagingCounter = productPaginate1.pagingCounter;
      pageInfo.hasPrevPage = productPaginate1.hasPrevPage;
      pageInfo.hasNextPage = productPaginate1.hasNextPage;
      pageInfo.prevPage = productPaginate1.prevPage;
      pageInfo.nextPage = productPaginate1.nextPage;

      const dynamic_discounting = {
        dynamic_discountings: Data,
        pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all dynamic_discounting",
        {
          length: 1
        },
        dynamic_discounting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_dynamic_discounting(req, res) {
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
        flight_types: req.body.flight_types,
        flight_from: req.body.flight_from,
        flight_to: req.body.flight_to,
        fare_types: req.body.fare_types,
        airlines: req.body.airlines,
        dynamic_discounting: {
          discount_percentage: req.body.dynamic_discounting.discount_percentage,
          from_day: req.body.dynamic_discounting.from_day,
          to_day: req.body.dynamic_discounting.to_day
        },
        is_deleted: req.body.is_deleted
      };

      const update_dynamic_discounting = await dynamic_discounting_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update dynamic_discounting",
        {
          length: 1
        },
        update_dynamic_discounting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_dynamic_discounting(req, res) {
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

      const Data = {
        is_deleted: true
      };

      const delete_dynamic_discounting = await dynamic_discounting_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete dynamic_discounting",
        {
          length: 1
        },
        delete_dynamic_discounting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
