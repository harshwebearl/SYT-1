const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const flight_commission_schema = require("../models/flight_commission.Schem");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");

module.exports = class flight_commission_Controller extends BaseController {
  async add_flight_commission(req, res) {
    try {
      console.log("123");
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
        commission_name: req.body.commission_name,
        customer_group: req.body.customer_group,
        fare_type: req.body.fare_type,
        service_type: req.body.service_type,
        airlines: req.body.airlines,
        is_all_airlines: req.body.is_all_airlines,
        class: req.body.class,
        is_all_class: req.body.is_all_class,
        is_all_segments: req.body.is_all_segments,
        base_fare: req.body.base_fare,
        total_fare: req.body.total_fare,
        discount: req.body.discount,
        markup_type: req.body.markup_type,
        yq: req.body.yq,
        segments: {
          from_String: req.body.segments.from_String,
          to_String: req.body.segments.to_String
        }
      };

      const add_flight_commission = new flight_commission_schema(data);
      const Add_flight_commission = await add_flight_commission.save();

      return this.sendJSONResponse(
        res,
        "add flight_commission ",
        {
          length: 1
        },
        Add_flight_commission
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_flight_commission(req, res) {
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

      const display_flight_commission = await flight_commission_schema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display  flight_commission",
        {
          length: 1
        },
        display_flight_commission
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_flight_commission(req, res) {
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
        result = await flight_commission_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        productPaginate1 = await flight_commission_schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            agency_id: element.id,
            _id: element._id,
            commission_name: element.commission_name,
            customer_group: element.customer_group,
            fare_type: element.fare_type,
            service_type: element.service_type,
            airlines: element.airlines,
            is_all_airlines: element.is_all_airlines,
            class: element.class,
            is_all_class: element.is_all_class,
            is_all_segments: element.is_all_segments,
            base_fare: element.base_fare,
            total_fare: element.total_fare,
            discount: element.discount,
            markup_type: element.markup_type,
            yq: element.yq,
            is_deleted: element.is_deleted,
            segments: {
              from_String: element.segments.from_String,
              to_String: element.segments.to_String
            }
          });
        });
      } else {
        // console.log("456");
        result = await flight_commission_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        productPaginate1 = await flight_commission_schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            agency_id: element.id,
            _id: element._id,
            commission_name: element.commission_name,
            customer_group: element.customer_group,
            fare_type: element.fare_type,
            service_type: element.service_type,
            airlines: element.airlines,
            is_all_airlines: element.is_all_airlines,
            class: element.class,
            is_all_class: element.is_all_class,
            is_all_segments: element.is_all_segments,
            base_fare: element.base_fare,
            total_fare: element.total_fare,
            discount: element.discount,
            markup_type: element.markup_type,
            yq: element.yq,
            is_deleted: element.is_deleted,
            segments: {
              from_String: element.segments.from_String,
              to_String: element.segments.to_String
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

      const flight_commission = {
        flight_commissions: Data,
        pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all flight_commission",
        {
          length: 1
        },
        flight_commission
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_flight_commission(req, res) {
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
        commission_name: req.body.commission_name,
        customer_group: req.body.customer_group,
        fare_type: req.body.fare_type,
        service_type: req.body.service_type,
        airlines: req.body.airlines,
        is_all_airlines: req.body.is_all_airlines,
        class: req.body.class,
        is_all_class: req.body.is_all_class,
        is_all_segments: req.body.is_all_segments,
        base_fare: req.body.base_fare,
        total_fare: req.body.total_fare,
        discount: req.body.discount,
        markup_type: req.body.markup_type,
        yq: req.body.yq,
        segments: {
          from_String: req.body.segments.from_String,
          to_String: req.body.segments.to_String
        },
        is_deleted: req.body.is_deleted
      };

      const update_flight_commission = await flight_commission_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update flight_commission",
        {
          length: 1
        },
        update_flight_commission
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_flight_commission(req, res) {
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

      const delete_flight_commission = await flight_commission_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete flight_commission",
        {
          length: 1
        },
        delete_flight_commission
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
