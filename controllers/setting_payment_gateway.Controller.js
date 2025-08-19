const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const setting_payment_gateway_Schema = require("../models/setting_payment_gateway_Schema");
const mongoose = require("mongoose");

module.exports = class setting_payment_gateway_Controller extends BaseController {
  async add_setting_payment_gateway(req, res) {
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
        razor_pay: {
          key: req.body.razor_pay.key,
          secret_key: req.body.razor_pay.secret_key
        },
        cc_avenue: {
          key: req.body.cc_avenue.key,
          access_code: req.body.cc_avenue.access_code,
          encryption_key: req.body.cc_avenue.encryption_key
        }
      };
      const add_setting_payment_gateway = new setting_payment_gateway_Schema(data);
      const Add_setting_payment_gateway = await add_setting_payment_gateway.save();
      return this.sendJSONResponse(
        res,
        "add setting_payment_gateway",
        {
          length: 1
        },
        Add_setting_payment_gateway
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_setting_payment_gateway(req, res) {
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

      const display_setting_payment_gateway = await setting_payment_gateway_Schema.findOne({
        agency_id: tokenData.id
      });

      return this.sendJSONResponse(
        res,
        "display  setting_payment_gateway",
        {
          length: 1
        },
        display_setting_payment_gateway
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_setting_payment_gateway(req, res) {
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
        result = await setting_payment_gateway_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await setting_payment_gateway_Schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     agency_id: element.agency_id,
        //     razor_pay: {
        //       key: element.razor_pay.key,
        //       secret_key: element.razor_pay.secret_key
        //     },
        //     cc_avenue: {
        //       key: element.cc_avenue.key,
        //       access_code: element.cc_avenue.access_code,
        //       encryption_key: element.cc_avenue.encryption_key
        //     },
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        console.log("456");
        result = await setting_payment_gateway_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await setting_payment_gateway_Schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     agency_id: element.agency_id,
        //     razor_pay: {
        //       key: element.razor_pay.key,
        //       secret_key: element.razor_pay.secret_key
        //     },
        //     cc_avenue: {
        //       key: element.cc_avenue.key,
        //       access_code: element.cc_avenue.access_code,
        //       encryption_key: element.cc_avenue.encryption_key
        //     },
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

      const setting_payment_gateway = {
        setting_payment_gateways: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all setting_payment_gateway",
        {
          length: 1
        },
        setting_payment_gateway
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_setting_payment_gateway(req, res) {
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
        razor_pay: {
          key: req.body.razor_pay.key,
          secret_key: req.body.razor_pay.secret_key
        },
        cc_avenue: {
          key: req.body.cc_avenue.key,
          access_code: req.body.cc_avenue.access_code,
          encryption_key: req.body.cc_avenue.encryption_key
        },
        is_deleted: req.body.is_deleted
      };

      const update_setting_payment_gateway = await setting_payment_gateway_Schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update setting_payment_gateway",
        {
          length: 1
        },
        update_setting_payment_gateway
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_setting_payment_gateway(req, res) {
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

      const delete_setting_payment_gateway = await setting_payment_gateway_Schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete setting_payment_gateway",
        {
          length: 1
        },
        delete_setting_payment_gateway
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
