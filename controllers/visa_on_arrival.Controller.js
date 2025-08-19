const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const  visa_on_ArrivalSchema= require("../models/visa_on_arrival.Schema");
const mongoose = require("mongoose");
const Bidschema = require("../models/bidSchema");

module.exports = class TransactionController extends BaseController {
  async AddTransactonData(req, res) {
    try {
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
        destination_id:req.body.destination_id
      };
      const visa_on_ArrivalData = new visa_on_ArrivalSchema(data);
      const visa_on_Arrival_Data = await visa_on_ArrivalData.save();

      return this.sendJSONResponse(
        res,
        "Add visa_on_Arrival",
        {
          length: 1
        },
        visa_on_Arrival_Data
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};