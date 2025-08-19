const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const hotel_booking_Schema = require("../models/hotel_booking.Schema");
const mongoose = require("mongoose");

module.exports = class hotel_booking_Controller extends BaseController {
  async add_hotel_booking(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "customer") {
        throw new Forbidden("you are not customer");
      }

      const data = {
        customer_id: tokenData.id,
        booking_detail: {
          customer_name: req.body.booking_detail.customer_name,
          customer_email: req.body.booking_detail.customer_email,
          customer_phone: req.body.booking_detail.customer_phone,
          check_in: req.body.booking_detail.check_in,
          check_out: req.body.booking_detail.check_out,
          hotel_name: req.body.booking_detail.hotel_name,
          invoice: req.body.booking_detail.invoice,
          voucher: req.body.booking_detail.voucher,
          total_amount: req.body.booking_detail.total_amount
        },
        lead_pax_detail: {
          first_name: req.body.lead_pax_detail.first_name,
          last_name: req.body.lead_pax_detail.last_name
        }
      };
      const add_hotel_booking = new hotel_booking_Schema(data);
      const Add_hotel_booking = await add_hotel_booking.save();
      return this.sendJSONResponse(
        res,
        "add hotel_booking",
        {
          length: 1
        },
        Add_hotel_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_hotel_booking(req, res) {
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

      const display_hotel_booking = await hotel_booking_Schema.find({ _id: _id });

      return this.sendJSONResponse(
        res,
        "display  hotel_booking",
        {
          length: 1
        },
        display_hotel_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_hotel_booking(req, res) {
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
        result = await hotel_booking_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }]
            }
          }
        ]);
        productPaginate1 = await hotel_booking_Schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            customer_id: element.id,
            booking_detail: {
              customer_name: element.booking_detail.customer_name,
              customer_email: element.booking_detail.customer_email,
              customer_phone: element.booking_detail.customer_phone,
              check_in: element.booking_detail.check_in,
              check_out: element.booking_detail.check_out,
              hotel_name: element.booking_detail.hotel_name,
              invoice: element.booking_detail.invoice,
              voucher: element.booking_detail.voucher,
              total_amount: element.booking_detail.total_amount
            },
            lead_pax_detail: {
              first_name: element.lead_pax_detail.first_name,
              last_name: element.lead_pax_detail.last_name
            },
            _id: element._id,
            is_deleted: element.is_deleted,
            createdAt: element.createdAt,
            updatedAt: element.updatedAt
          });
        });
      } else {
        console.log("456");
        result = await hotel_booking_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }]
            }
          }
        ]);
        productPaginate1 = await hotel_booking_Schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            customer_id: element.id,
            booking_detail: {
              customer_name: element.booking_detail.customer_name,
              customer_email: element.booking_detail.customer_email,
              customer_phone: element.booking_detail.customer_phone,
              check_in: element.booking_detail.check_in,
              check_out: element.booking_detail.check_out,
              hotel_name: element.booking_detail.hotel_name,
              invoice: element.booking_detail.invoice,
              voucher: element.booking_detail.voucher,
              total_amount: element.booking_detail.total_amount
            },
            lead_pax_detail: {
              first_name: element.lead_pax_detail.first_name,
              last_name: element.lead_pax_detail.last_name
            },
            _id: element._id,
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

      const hotel_bookings = {
        hotel_booking: Data,
        pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all hotel_booking",
        {
          length: 1
        },
        hotel_bookings
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_hotel_booking(req, res) {
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

      const update_hotel_booking = await hotel_booking_Schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update hotel_booking",
        {
          length: 1
        },
        update_hotel_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_hotel_booking(req, res) {
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

      const delete_hotel_booking = await hotel_booking_Schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete hotel_booking",
        {
          length: 1
        },
        delete_hotel_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
