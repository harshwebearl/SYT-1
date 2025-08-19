const BaseController = require("../controllers/BaseController");
const about_schema = require("../models/about_schema");
const userSchema = require("../models/usersSchema");
const NotFound = require("../errors/NotFound");
const Forbidden = require("../errors/Forbidden");
const mongoose = require("mongoose");

module.exports = class Blogger extends BaseController {
  // async add_about(req, res) {
  //     try {
  //         const tokenData = req.userData;
  //         if (tokenData === "") {
  //             return res.status(401).json({
  //                 message: "Auth fail"
  //             });
  //         }
  //         const userData = await userSchema.find({ _id: tokenData.id });

  //         if (userData[0].role !== "admin") {
  //             throw new Forbidden("you are not admin");
  //         }

  //         const about_data = {
  //             description: req.body.description
  //         };

  //         const new_about = new about_schema(about_data);
  //         const result = await new_about.save();

  //         return this.sendJSONResponse(
  //             res,
  //             "About Added!",
  //             {
  //                 length: 1
  //             },
  //             result
  //         );
  //     } catch (error) {
  //         if (error instanceof NotFound) {
  //             throw error;
  //         }
  //         return this.sendErrorResponse(req, res, error);
  //     }
  // }

  async get_about(req, res) {
    try {
      const result = await about_schema.findOne({});

      return this.sendJSONResponse(
        res,
        "Data!",
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

  async update_about(req, res) {
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

      if (req.body.description == "" || req.body.description == undefined) {
        throw new Forbidden("please enter valid description for about");
      }

      const about_data = {
        description: req.body.description
      };

      const result = await about_schema.findOneAndUpdate({}, about_data, { new: true });

      return this.sendJSONResponse(
        res,
        "About Content Updated!",
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
