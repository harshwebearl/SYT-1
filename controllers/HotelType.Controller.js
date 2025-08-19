const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const hotelTypeSchema = require("../models/HotelTypeSchema");
const BaseController = require("./BaseController");
const userSchema = require("../models/usersSchema");

module.exports = class HotelTypeColler extends BaseController {
  async createHotel(req, res) {
    try {
      // const tokenData = req.userData;
      // if (tokenData.type !== "admin") {
      //   throw new Forbidden("you can not add hotel");
      // }
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const data = {
        name: req.body.name
      };
      const insertedData = new hotelTypeSchema(data);
      const hotelType = await insertedData.save();
      return this.sendJSONResponse(
        res,
        "hotel added",
        {
          length: 1
        },
        "hoteltype added successfully"
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async getHotels(req, res) {
    try {
      const hotelType = await hotelTypeSchema.find();
      return this.sendJSONResponse(
        res,
        "hotel types retrived",
        {
          length: 1
        },
        hotelType
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async updateHotel(req, res) {
    try {
      const hotel_id = req.query.hotel_id;

      // const tokenData = req.userData;
      // if (tokenData.type !== "admin") {
      //   throw new Forbidden("you can not add hotel");
      // }
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const data = {
        name: req.body.name
      };
      const updatedData = await hotelTypeSchema.findByIdAndUpdate({ _id: hotel_id }, data);
      return this.sendJSONResponse(
        res,
        "hotel updated",
        {
          length: 1
        },
        "hoteltype updated successfully"
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async deleteHotel(req, res) {
    try {
      const hotel_id = req.query.hotel_id;

      // const tokenData = req.userData;
      // if (tokenData.type !== "admin") {
      //   throw new Forbidden("you can not deleted hotel");
      // }

      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const deletedData = await hotelTypeSchema.findByIdAndDelete({ _id: hotel_id });
      return this.sendJSONResponse(
        res,
        "hotel delete",
        {
          length: 1
        },
        "hoteltype deleted successfully"
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
