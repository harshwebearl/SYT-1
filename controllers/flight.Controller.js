const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const flight_Schema = require("../models/flights_Schema");
const mongoose = require("mongoose");

module.exports = class flight_Controller extends BaseController {
  async add_flight(req, res) {
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
        PNR: req.body.PNR,
        airline: req.body.airline,
        customer: req.body.customer,
        origin: req.body.origin,
        destination: req.body.destination,
        purchased: req.body.purchased,
        markup: req.body.markup,
        sales_amt: req.body.sales_amt,
        booking: req.body.booking,
        depart_dateTime: req.body.depart_dateTime,
        status: req.body.status
      };
      const add_flight = new flight_Schema(data);
      const Add_flight = await add_flight.save();
      return this.sendJSONResponse(
        res,
        "add flight",
        {
          length: 1
        },
        Add_flight
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_flight(req, res) {
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

      const display_flight = await flight_Schema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display  flight",
        {
          length: 1
        },
        display_flight
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_flight(req, res) {
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
        result = await flight_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        productPaginate1 = await flight_Schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            _id: element._id,
            title: element.title,
            first_name: element.first_name,
            address: element.address,
            dob: element.dob,
            gender: element.gender,
            country: element.country,
            state: element.state,
            anniversary: element.anniversary,
            email: element.email,
            city: element.city,
            pincode: element.pincode,
            isd_code: element.isd_code,
            mobile: element.mobile,
            pan_no: element.pan_no,
            gst_no: element.gst_no,
            password: element.password,
            reference: element.reference,
            customer_type: element.customer_type,
            agency_id: element.agency_id,
            is_deleted: element.is_deleted,
            createdAt: element.createdAt,
            updatedAt: element.updatedAt
          });
        });
      } else {
        console.log("456");
        result = await flight_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        productPaginate1 = await flight_Schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            _id: element._id,
            title: element.title,
            first_name: element.first_name,
            address: element.address,
            dob: element.dob,
            gender: element.gender,
            country: element.country,
            state: element.state,
            anniversary: element.anniversary,
            email: element.email,
            city: element.city,
            pincode: element.pincode,
            isd_code: element.isd_code,
            mobile: element.mobile,
            pan_no: element.pan_no,
            gst_no: element.gst_no,
            password: element.password,
            reference: element.reference,
            customer_type: element.customer_type,
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

      const flights = {
        flight: Data,
        pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all flight",
        {
          length: 1
        },
        flights
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_flight(req, res) {
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
        PNR: req.body.PNR,
        airline: req.body.airline,
        customer: req.body.customer,
        origin: req.body.origin,
        destination: req.body.destination,
        purchased: req.body.purchased,
        markup: req.body.markup,
        sales_amt: req.body.sales_amt,
        booking: req.body.booking,
        depart_dateTime: req.body.depart_dateTime,
        status: req.body.status,
        is_deleted: req.body.is_deleted
      };

      const update_flight = await flight_Schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, Data);
      return this.sendJSONResponse(
        res,
        "update flight",
        {
          length: 1
        },
        update_flight
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_flight(req, res) {
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

      const delete_flight = await flight_Schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete flight",
        {
          length: 1
        },
        delete_flight
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
