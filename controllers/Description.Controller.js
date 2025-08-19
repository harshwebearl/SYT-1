const BaseController = require("./BaseController");
const NotFound = require("../errors/NotFound");
const Forbidden = require("../errors/Forbidden");
const mongoose = require("mongoose");
const DescriptionSchema = require("../models/DescriptionSchema");
const adminSchema = require("../models/AdminSchema");
const userSchema = require("../models/usersSchema");

module.exports = class Description extends BaseController {
  async updateDescription(req, res) {
    try {
      // const _id = req.query._id;
      // const tokenData = req.userData;
      // const adminData = await adminSchema({ _id: tokenData.id });

      // if (adminData.length === 0) {
      //   throw new Forbidden("you are not admin");
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

      const Data = {
        description: req.body.description
      };
      const UpdateDescription = await DescriptionSchema(Data);
      const updatedescription = await UpdateDescription.save();
      return this.sendJSONResponse(
        res,
        "data updated",
        {
          length: 1
        },
        updatedescription
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
