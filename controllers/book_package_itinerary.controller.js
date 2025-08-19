const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const book_package_itinerary_schema = require("../models/book_package_itinerary_schema");
const NotFound = require("../errors/NotFound");

module.exports = class book_package_itinerary_controller extends BaseController {
  async add_book_package_itinerary(req, res) {
    try {
      const insertData = {
        book_package_id: req.body.book_package_id,
        day: req.body.day,
        hotel: req.body.hotel,
        title: req.body.title,
        activity: req.body.activity,
        bid_id: req.body.bid_id,
        custom_package_id: req.body.custom_package_id,
        itinery_date: req.body.itinery_date
      };
      const book_package_itinerary = new book_package_itinerary_schema(insertData);
      const Book_package_itinerary = await book_package_itinerary.save();

      this.sendJSONResponse(
        res,
        "book package itinerary is added",
        {
          length: 1
        },
        Book_package_itinerary
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_book_package_itinerary(req, res) {
    try {
      const _id = req.query.book_package_id;
      const book_package_itinerary = await book_package_itinerary_schema.find({ book_package_id: _id });
      if (book_package_itinerary.length === 0) {
        throw new Forbidden(" book package itinerary is not found");
      }
      // console.log(book_package_itinerary);
      return this.sendJSONResponse(
        res,
        "book package itinerary is retrived",
        {
          length: 1
        },
        book_package_itinerary
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
