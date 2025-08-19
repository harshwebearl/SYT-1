const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const flight_booking_schema = require("../models/flight_booking.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const fn = "flight_booking";
module.exports = class flight_booking_Controller extends BaseController {
  async add_flight_booking(req, res) {
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
        trip_type: req.body.trip_type,
        meal: req.body.meal,
        refundable: req.body.refundable,
        fare_rule: req.body.fare_rule,
        onward: {
          airline: req.body.onward.airline,
          flight_num: req.body.onward.flight_num,
          origin: req.body.onward.origin,
          destination: req.body.onward.destination,
          // airlines_img: generateFilePathForDB(req.file),
          airlines_img: req.files.airlines_img[0].filename,
          class: req.body.onward.class,
          stop: req.body.onward.stop,
          from_date: req.body.onward.from_date,
          to_date: req.body.onward.to_date
        },
        fare_detail: {
          date: req.body.fare_detail.date,
          base_fare: req.body.fare_detail.base_fare,
          other_tax: req.body.fare_detail.other_tax,
          infant_tax: req.body.fare_detail.infant_tax,
          service_fee: req.body.fare_detail.service_fee,
          total_fare: req.body.fare_detail.total_fare,
          PNR: req.body.fare_detail.PNR,
          seats: req.body.fare_detail.seats
        }
      };

      const add_flight_booking = new flight_booking_schema(data);
      const Add_flight_booking = await add_flight_booking.save();
      //   console.log(Add_flight_booking);
      //   Add_flight_booking.thumb_img = generateDownloadLink(Add_flight_booking.thumb_img);
      //   Add_flight_booking.banner_img = generateDownloadLink(Add_flight_booking.banner_img);
      //   Add_flight_booking.currency_img = generateDownloadLink(Add_flight_booking.currency_img);

      // Add_flight_booking.icon_img = generateDownloadLink(Add_flight_booking.icon_img);

      return this.sendJSONResponse(
        res,
        "Add flight_booking",
        {
          length: 1
        },
        Add_flight_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_flight_booking(req, res) {
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

      const display_flight_booking = await flight_booking_schema.find({ agency_id: tokenData.id, _id: _id });

      // display_flight_booking[0].onward.airlines_img =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_flight_booking[0].onward.airlines_img;
      display_flight_booking[0].onward.airlines_img = await image_url(
        fn,
        display_flight_booking[0].onward.airlines_img
      );

      //   display_flight_booking[0].banner_img = generateFileDownloadLinkPrefix(req.localHostURL) + display_flight_booking[0].banner_img;
      //   display_flight_booking[0].currency_img = generateFileDownloadLinkPrefix(req.localHostURL) + display_flight_booking[0].currency_img;

      return this.sendJSONResponse(
        res,
        "display  flight_booking",
        {
          length: 1
        },
        display_flight_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_flight_booking(req, res) {
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
        // console.log("123");
        result = await flight_booking_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        productPaginate1 = await flight_booking_schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            _id: element._id,
            agency_id: element.id,
            trip_type: element.trip_type,
            meal: element.meal,
            refundable: element.refundable,
            fare_rule: element.fare_rule,
            is_deleted: element.is_deleted,
            onward: {
              airline: element.onward.airline,
              flight_num: element.onward.flight_num,
              origin: element.onward.origin,
              destination: element.onward.destination,
              airlines_img: element.airlines_img,
              class: element.onward.class,
              stop: element.onward.stop,
              from_date: element.onward.from_date,
              to_date: element.onward.to_date
            },
            fare_detail: {
              date: element.fare_detail.date,
              base_fare: element.fare_detail.base_fare,
              other_tax: element.fare_detail.other_tax,
              infant_tax: element.fare_detail.infant_tax,
              service_fee: element.fare_detail.service_fee,
              total_fare: element.fare_detail.total_fare,
              PNR: element.fare_detail.PNR,
              seats: element.fare_detail.seats
            }
          });
        });
      } else {
        // console.log("456");
        result = await flight_booking_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        productPaginate1 = await flight_booking_schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            _id: element._id,
            agency_id: element.id,
            trip_type: element.trip_type,
            meal: element.meal,
            refundable: element.refundable,
            fare_rule: element.fare_rule,
            is_deleted: element.is_deleted,
            onward: {
              airline: element.onward.airline,
              flight_num: element.onward.flight_num,
              origin: element.onward.origin,
              destination: element.onward.destination,
              airlines_img: element.airlines_img,
              class: element.onward.class,
              stop: element.onward.stop,
              from_date: element.onward.from_date,
              to_date: element.onward.to_date
            },
            fare_detail: {
              date: element.fare_detail.date,
              base_fare: element.fare_detail.base_fare,
              other_tax: element.fare_detail.other_tax,
              infant_tax: element.fare_detail.infant_tax,
              service_fee: element.fare_detail.service_fee,
              total_fare: element.fare_detail.total_fare,
              PNR: element.fare_detail.PNR,
              seats: element.fare_detail.seats
            }
          });
        });
      }
      for (let i = 0; i < Data.length; i++) {
        // Data[i].onward.airlines_img = generateFileDownloadLinkPrefix(req.localHostURL) + Data[i].onward.airlines_img;
        Data[i].onward.airlines_img = await image_url(fn, Data[i].onward.airlines_img);
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

      const flight_booking = {
        flight_bookings: Data,
        pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all flight_booking",
        {
          length: 1
        },
        flight_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_flight_booking(req, res) {
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
        trip_type: req.body.trip_type,
        meal: req.body.meal,
        refundable: req.body.refundable,
        fare_rule: req.body.fare_rule,
        onward: {
          airline: req.body.onward.airline,
          flight_num: req.body.onward.flight_num,
          origin: req.body.onward.origin,
          destination: req.body.onward.destination,
          // airlines_img: generateFilePathForDB(req.file),
          airlines_img: req.files?.airlines_img?.[0]?.filename,
          class: req.body.onward.class,
          stop: req.body.onward.stop,
          from_date: req.body.onward.from_date,
          to_date: req.body.onward.to_date
        },
        fare_detail: {
          date: req.body.fare_detail.date,
          base_fare: req.body.fare_detail.base_fare,
          other_tax: req.body.fare_detail.other_tax,
          infant_tax: req.body.fare_detail.infant_tax,
          service_fee: req.body.fare_detail.service_fee,
          total_fare: req.body.fare_detail.total_fare,
          PNR: req.body.fare_detail.PNR,
          seats: req.body.fare_detail.seats
        },
        is_deleted: req.body.is_deleted
      };

      const update_flight_booking = await flight_booking_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update flight_booking",
        {
          length: 1
        },
        update_flight_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_flight_booking(req, res) {
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

      const delete_flight_booking = await flight_booking_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete flight_booking",
        {
          length: 1
        },
        delete_flight_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
