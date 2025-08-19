const amenities_and_facilities_schema = require("../models/amenities_and_facilities_syt_model");
const hotel_schema = require("../models/hotel_syt_schema");
const fs = require("fs");
// const notFound = require("../errors/NotFound");
const Forbidden = require("../errors/Forbidden");
const BaseController = require("./BaseController");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const mongoose = require("mongoose");

module.exports = class Amenities_and_facilities extends BaseController {
  async add_amenities_and_facilities(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency") {
        throw new Forbidden("you are not admin or agency");
      }

      const amenities_and_facilities = {
        title: req.body.title,
        points: req.body.points,
        hotel_id: req.body.hotel_id
      };

      const new_amenities_and_facilities = new amenities_and_facilities_schema(amenities_and_facilities);

      const result = await new_amenities_and_facilities.save();

      if (result.length == 0) {
        throw new Forbidden("Amenities and Facilities not saved ! please insert again");
      }

      return this.sendJSONResponse(
        res,
        "Amenities and Facilities Added Succesfully !",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async get_amenities_and_facilities(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency" && userData[0].role !== "customer") {
        throw new Forbidden("you are not admin or agency or customer");
      }

      const amenities_and_facilities = await amenities_and_facilities_schema.find();

      if (amenities_and_facilities.length == 0) {
        throw new Forbidden("No Amenities and Facilities Found");
      }

      return this.sendJSONResponse(
        res,
        "Amenities and Facilities Data!",
        {
          length: 1
        },
        amenities_and_facilities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async get_amenities_and_facilities_by_hotelid(req, res) {
    try {
      const hotel_id = req.query.hotel_id;

      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency" && userData[0].role !== "customer") {
        throw new Forbidden("you are not admin or agency or customer");
      }

      const amenities_and_facilities = await hotel_schema.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(hotel_id) }
        },
        {
          $lookup: {
            from: "amenities_and_facilities",
            localField: "_id",
            foreignField: "hotel_id",
            as: "amenities_and_facilities"
          }
        },
        {
          $project: {
            hotel_name: 1,
            hotel_address: 1,
            hotel_id: "$_id",
            amenities_and_facilities: 1
          }
        }
      ]);

      if (amenities_and_facilities.length == 0) {
        throw new Forbidden("No Amenities and Facilities Found");
      }

      return this.sendJSONResponse(
        res,
        "Amenities and Facilities Data!",
        {
          length: 1
        },
        amenities_and_facilities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async get_amenities_and_facilities_by_id(req, res) {
    try {
      const amenities_and_facilities_id = req.query._id;

      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency" && userData[0].role !== "customer") {
        throw new Forbidden("you are not admin or agency or customer");
      }

      const amenities_and_facilities = await amenities_and_facilities_schema.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(amenities_and_facilities_id) }
        },
        {
          $lookup: {
            from: "hotel_syts",
            localField: "hotel_id",
            foreignField: "_id",
            as: "hotel_detais"
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            points: 1,
            hotel_detais: {
              _id: 1,
              hotel_name: 1,
              hotel_address: 1
            }
          }
        }
      ]);

      if (amenities_and_facilities.length == 0) {
        throw new Forbidden("No Amenities and Facilities Found");
      }

      return this.sendJSONResponse(
        res,
        "Amenities and Facilities Data!",
        {
          length: 1
        },
        amenities_and_facilities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_amenities_and_facilities(req, res) {
    try {
      const id = req.query._id;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency") {
        throw new Forbidden("you are not admin or agency");
      }

      const amenities_and_facilities = {
        title: req.body.title,
        points: req.body.points,
        hotel_id: req.body.hotel_id
      };

      const updatedAmenities = await amenities_and_facilities_schema.findByIdAndUpdate(id, amenities_and_facilities, {
        new: true
      });

      if (updatedAmenities.length == 0) {
        throw new Forbidden("Amenities and Facilitie not Updated ! please try again");
      }

      return this.sendJSONResponse(
        res,
        "Amenities and Facilities Updated succesfully!",
        {
          length: 1
        },
        updatedAmenities
      );
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  }

  async delete_amenities_and_facilities(req, res) {
    try {
      const id = req.query._id;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency") {
        throw new Forbidden("you are not admin or agency");
      }

      const result = await amenities_and_facilities_schema.deleteOne({ _id: id });
      if (!result) {
        throw new Forbidden("Amenities and Facilities did not deleted succesfully");
      }

      return this.sendJSONResponse(
        res,
        "Amenities and Facilities Deleted succesfully!",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
