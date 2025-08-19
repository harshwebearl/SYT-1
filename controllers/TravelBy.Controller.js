const { errorMonitor } = require("nodemailer/lib/xoauth2");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const travelBySchema = require("../models/TravelBySchema");
const BaseController = require("./BaseController");
const userSchema = require("../models/usersSchema");

module.exports = class travelByController extends BaseController {
  async addVehicle(req, res) {
    try {
      // const tokenData = req.userData;
      // if (tokenData.type !== "admin") {
      //   throw new Forbidden("you can not add vehicle");
      // }
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData);
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const data = {
        name: req.body.name
      };
      const insertVehicle = new travelBySchema(data);
      const vehicle = await insertVehicle.save();

      return this.sendJSONResponse(
        res,
        "vehicle added",
        {
          length: 1
        },
        vehicle
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async getVehicle(req, res) {
    try {
      const getVehicle = await travelBySchema.find();
      return this.sendJSONResponse(
        res,
        "vehicle retived",
        {
          length: 1
        },
        getVehicle
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async updateVehicle(req, res) {
    try {
      const travelBy_id = req.query.traveby_id;
      // const tokenData = req.userData;
      // if (tokenData.type !== "admin") {
      //   throw new Forbidden("you can not update vehicle");
      // }
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData);
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const data = {
        name: req.body.name
      };
      const updatedData = await travelBySchema.findByIdAndUpdate({ _id: travelBy_id }, data);

      return this.sendJSONResponse(
        res,
        "vehicle data updated",
        {
          length: 1
        },
        "vehicle data updated"
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async deleteVehicle(req, res) {
    try {
      const travelBy_id = req.query.traveby_id;
      // const tokenData = req.userData;
      // if (tokenData.type !== "admin") {
      //   throw new Forbidden("you can not update vehicle");
      // }
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData);
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const deleteData = await travelBySchema.findByIdAndDelete({ _id: travelBy_id });

      return this.sendJSONResponse(
        res,
        "vehicle data delete",
        {
          length: 1
        },
        "vehicle data deleted"
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
