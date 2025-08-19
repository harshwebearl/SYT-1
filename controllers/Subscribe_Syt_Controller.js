const mongoose = require("mongoose");
const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const subscriber_syt_schema = require("../models/Subscribe_Syt_schema");

module.exports = class Subscribe_Syt_Controller extends BaseController {
  async add_subscribe_syt(req, res) {
    try {
      const tokenData = req.userData;

      const subscriber_data = await subscriber_syt_schema.find({ Emailid: req.body.email_id });

      if (subscriber_data.length != 0) {
        throw new Forbidden("You are Already Subscriber");
      }

      const new_subscriber = {
        Emailid: req.body.email_id
      };

      if (tokenData && tokenData.id) {
        const userData = await userSchema.find({ _id: tokenData.id });
        new_subscriber.Userid = tokenData.id;
      }

      const subscriber_syt = new subscriber_syt_schema(new_subscriber);
      const result = await subscriber_syt.save();

      return this.sendJSONResponse(
        res,
        "Subscribe Add !",
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

  async view_subscribe_syt(req, res) {
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

      const subscriber_data = await subscriber_syt_schema.find({});

      return this.sendJSONResponse(
        res,
        "Subscribe List !",
        {
          length: 1
        },
        subscriber_data
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
