const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const booking_policies_schema = require("../models/booking_policies.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");

module.exports = class booking_policies_Controller extends BaseController {
  async add_booking_policies(req, res) {
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

      //    const additional_fields = {
      //        name:req.body.name,
      //        control_type:req.body.control_type
      // }
      //  const additional_fields = [];

      const data = {
        agency_id: tokenData.id,
        name: req.body.name,
        description: req.body.description,
        packages: req.body?.packages,
        booking_policy: req.body.booking_policy,
        cancellation_policy: req.body.cancellation_policy
      };

      //  const additional_fields = {
      //     name:req.body.name,
      //     control_type:req.body.control_type
      //  }
      //  const result ={
      //   data,
      //   // additional_fields
      //  }

      const add_booking_policies = new booking_policies_schema(data);
      const Add_booking_policies = await add_booking_policies.save();

      //   Add_currencies.photo = generateDownloadLink(Add_currencies.photo);

      return this.sendJSONResponse(
        res,
        "add booking_policies",
        {
          length: 1
        },
        Add_booking_policies
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_booking_policies(req, res) {
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

      const display_booking_policies = await booking_policies_schema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display  booking_policies",
        {
          length: 1
        },
        display_booking_policies
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_booking_policies(req, res) {
    try {
      // const is_deleted = req.query.is_deleted;
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

      let { limit, pages, is_deleted } = req.query;
      if ([null, undefined, ""].includes(pages)) {
        pages = 1;
      }
      if ([null, undefined, "", 1].includes(limit)) {
        limit = 50;
      }
      const option = {
        limit: limit,
        pages: pages
      };

      // let productPaginate1;
      // let Data = [];
      let result;
      if (is_deleted === "true") {
        // console.log("123");
        result = await booking_policies_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await booking_policies_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     agency_id: element.id,
        //     _id: element._id,
        //     is_deleted: element.is_deleted,
        //     name: element.name,
        //     description: element.description,
        //     packages: element.packages,
        //     booking_policy: {
        //       lto15days: element.booking_policy.lto15days,
        //       _15to30days: element.booking_policy._15to30days,
        //       _30to45days: element.booking_policy._30to45days,
        //       gt45days: element.booking_policy.gt45days,
        //       description: element.booking_policy.description
        //     },
        //     cancellation_policy: {
        //       lto15days: element.cancellation_policy.lto15days,
        //       _15to30days: element.cancellation_policy._15to30days,
        //       _30to45days: element.cancellation_policy._30to45days,
        //       gt45days: element.cancellation_policy.gt45days,
        //       description: element.cancellation_policy.description
        //     }
        //   });
        // });
      } else {
        // console.log("456");
        result = await booking_policies_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await booking_policies_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     agency_id: element.id,
        //     _id: element._id,
        //     is_deleted: element.is_deleted,
        //     name: element.name,
        //     description: element.description,
        //     packages: element.packages,
        //     booking_policy: {
        //       lto15days: element.booking_policy.lto15days,
        //       _15to30days: element.booking_policy._15to30days,
        //       _30to45days: element.booking_policy._30to45days,
        //       gt45days: element.booking_policy.gt45days,
        //       description: element.booking_policy.description
        //     },
        //     cancellation_policy: {
        //       lto15days: element.cancellation_policy.lto15days,
        //       _15to30days: element.cancellation_policy._15to30days,
        //       _30to45days: element.cancellation_policy._30to45days,
        //       gt45days: element.cancellation_policy.gt45days,
        //       description: element.cancellation_policy.description
        //     }
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

      const booking_policies = {
        booking_policie: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all booking_policies",
        {
          length: 1
        },
        booking_policies
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_booking_policies(req, res) {
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
        name: req.body.name,
        description: req.body.description,
        booking_policy: req.body.booking_policy,
        cancellation_policy: req.body.cancellation_policy,
        packages: req.body.packages,
        is_deleted: req.body.is_deleted
      };

      const update_booking_policies = await booking_policies_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data,
        { new: true }
      );
      return this.sendJSONResponse(
        res,
        "update booking_policies",
        {
          length: 1
        },
        update_booking_policies
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_booking_policies(req, res) {
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

      const Data = {
        is_deleted: true
      };

      const delete_booking_policies = await booking_policies_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete booking_policies",
        {
          length: 1
        },
        delete_booking_policies
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
