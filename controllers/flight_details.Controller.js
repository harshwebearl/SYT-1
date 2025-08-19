const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const flight_detail_Schema = require("../models/flight_detail.Schema");
const mongoose = require("mongoose");

module.exports = class flight_detail_Controller extends BaseController {
  async add_flight_detail(req, res) {
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
        Booking_id: req.body.Booking_id,
        customer_email: req.body.customer_email,
        customer_mobile: req.body.customer_mobile,
        booking_amount: req.body.booking_amount,
        airline_name: req.body.airline_name,
        booking_date: req.body.booking_date,
        status: req.body.status,
        refund_status: req.body.refund_status
      };
      const add_flight_detail = new flight_detail_Schema(data);
      const Add_flight_detail = await add_flight_detail.save();
      return this.sendJSONResponse(
        res,
        "add flight_detail",
        {
          length: 1
        },
        Add_flight_detail
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_flight_detail(req, res) {
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

      const display_flight_detail = await flight_detail_Schema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display  flight_detail",
        {
          length: 1
        },
        display_flight_detail
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_flight_detail(req, res) {
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

      let { limit, page, is_deleted } = req.query;
      if ([null, undefined, ""].includes(page)) {
        page = 1;
      }
      if ([null, undefined, "", 1].includes(limit)) {
        limit = 50;
      }
      const option = {
        limit: limit,
        page: page
      };

      let productPaginate1;
      let Data = [];
      let result;
      if (is_deleted === "true") {
        console.log("123");
        result = await flight_detail_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        productPaginate1 = await flight_detail_Schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            _id: element._id,
            Booking_id: element.Booking_id,
            customer_email: element.customer_email,
            customer_mobile: element.customer_mobile,
            booking_amount: element.booking_amount,
            airline_name: element.airline_name,
            booking_date: element.booking_date,
            status: element.status,
            refund_status: element.refund_status,
            agency_id: element.agency_id,
            is_deleted: element.is_deleted,
            createdAt: element.createdAt,
            updatedAt: element.updatedAt
          });
        });
      } else {
        console.log("456");
        result = await flight_detail_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        productPaginate1 = await flight_detail_Schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            _id: element._id,
            Booking_id: element.Booking_id,
            customer_email: element.customer_email,
            customer_mobile: element.customer_mobile,
            booking_amount: element.booking_amount,
            airline_name: element.airline_name,
            booking_date: element.booking_date,
            status: element.status,
            refund_status: element.refund_status,
            agency_id: element.agency_id,
            is_deleted: element.is_deleted,
            createdAt: element.createdAt,
            updatedAt: element.updatedAt
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

      const flight_details = {
        flight_detail: Data,
        pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all flight_detail",
        {
          length: 1
        },
        flight_details
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_flight_detail(req, res) {
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
        Booking_id: req.body.Booking_id,
        customer_email: req.body.customer_email,
        customer_mobile: req.body.customer_mobile,
        booking_amount: req.body.booking_amount,
        airline_name: req.body.airline_name,
        booking_date: req.body.booking_date,
        status: req.body.status,
        refund_status: req.body.refund_status,
        is_deleted: req.body.is_deleted
      };

      const update_flight_detail = await flight_detail_Schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update flight_detail",
        {
          length: 1
        },
        update_flight_detail
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_flight_detail(req, res) {
    try {
      console.log("123");
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

      const delete_flight_detail = await flight_detail_Schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete flight_detail",
        {
          length: 1
        },
        delete_flight_detail
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
