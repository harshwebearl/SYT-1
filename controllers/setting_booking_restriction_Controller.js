const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const setting_booking_restriction_Schema = require("../models/setting_booking_restriction_Schema");
const mongoose = require("mongoose");

module.exports = class setting_booking_restriction_Controller extends BaseController {
  async add_setting_booking_restriction(req, res) {
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
        no_of_booking: req.body.no_of_booking,
        ip_address_list: req.body.ip_address_list,
        phone_list: req.body.phone_list,
        email_list: req.body.email_list
      };
      const add_setting_booking_restriction = new setting_booking_restriction_Schema(data);
      const Add_setting_booking_restriction = await add_setting_booking_restriction.save();
      return this.sendJSONResponse(
        res,
        "add setting_booking_restriction",
        {
          length: 1
        },
        Add_setting_booking_restriction
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_setting_booking_restriction(req, res) {
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

      const display_setting_booking_restriction = await setting_booking_restriction_Schema.find({
        agency_id: tokenData.id
        // _id: _id
      });

      return this.sendJSONResponse(
        res,
        "display  setting_booking_restriction",
        {
          length: 1
        },
        display_setting_booking_restriction
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_setting_booking_restriction(req, res) {
    try {
      const is_deleted = req.query.is_deleted;

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

      // let { limit, page, is_deleted } = req.query;
      // if ([null, undefined, ""].includes(page)) {
      //   page = 1;
      // }
      // if ([null, undefined, "", 1].includes(limit)) {
      //   limit = 50;
      // }
      // const option = {
      //   limit: limit,
      //   page: page
      // };

      // let productPaginate1;
      // let Data = [];
      let result;
      if (is_deleted === "true") {
        console.log("123");
        result = await setting_booking_restriction_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await setting_booking_restriction_Schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     agency_id: element.agency_id,
        //     no_of_booking: element.no_of_booking,
        //     ip_address_list: element.ip_address_list,
        //     phone_list: element.phone_list,
        //     email_list: element.email_list,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        console.log("456");
        result = await setting_booking_restriction_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await setting_booking_restriction_Schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     agency_id: element.agency_id,
        //     no_of_booking: element.no_of_booking,
        //     ip_address_list: element.ip_address_list,
        //     phone_list: element.phone_list,
        //     email_list: element.email_list,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      }

      // const pageInfo = {};
      // pageInfo.totalDocs = productPaginate1.totalDocs;
      // pageInfo.limit = productPaginate1.limit;
      // pageInfo.page = productPaginate1.page;
      // pageInfo.totalPages = productPaginate1.totalDocs;
      // pageInfo.pagingCounter = productPaginate1.pagingCounter;
      // pageInfo.hasPrevPage = productPaginate1.hasPrevPage;
      // pageInfo.hasNextPage = productPaginate1.hasNextPage;
      // pageInfo.prevPage = productPaginate1.prevPage;
      // pageInfo.nextPage = productPaginate1.nextPage;

      const setting_booking_restriction = {
        setting_booking_restrictions: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all setting_booking_restriction",
        {
          length: 1
        },
        setting_booking_restriction
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_setting_booking_restriction(req, res) {
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
        no_of_booking: req.body.no_of_booking,
        ip_address_list: req.body.ip_address_list,
        phone_list: req.body.phone_list,
        email_list: req.body.email_list
      };

      const update_setting_booking_restriction = await setting_booking_restriction_Schema.findOneAndUpdate(
        {
          // _id: _id,
          agency_id: tokenData.id
        },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update setting_booking_restriction",
        {
          length: 1
        },
        update_setting_booking_restriction
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_setting_booking_restriction(req, res) {
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

      const delete_setting_booking_restriction = await setting_booking_restriction_Schema.findByIdAndUpdate(
        { _id: _id },
        Data
      );

      return this.sendJSONResponse(
        res,
        "delete setting_booking_restriction",
        {
          length: 1
        },
        delete_setting_booking_restriction
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
