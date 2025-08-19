const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const customer_2_Schema = require("../models/customer_2_Schema");
const mongoose = require("mongoose");

module.exports = class customer_2_Controller extends BaseController {
  async add_customer_2(req, res) {
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
        title: req.body.title,
        first_name: req.body.first_name,
        address: req.body.address,
        dob: req.body.dob,
        gender: req.body.gender,
        country: req.body.country,
        state: req.body.state,
        anniversary: req.body.anniversary,
        email: req.body.email,
        city: req.body.city,
        pincode: req.body.pincode,
        isd_code: req.body.isd_code,
        mobile: req.body.mobile,
        pan_no: req.body.pan_no,
        gst_no: req.body.gst_no,
        password: req.body.password,
        reference: req.body.reference,
        customer_type: req.body.customer_type
      };
      const add_customer_2 = new customer_2_Schema(data);
      const Add_customer_2 = await add_customer_2.save();
      return this.sendJSONResponse(
        res,
        "add customer_2",
        {
          length: 1
        },
        Add_customer_2
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_customer_2(req, res) {
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

      const display_customer_2 = await customer_2_Schema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display  customer_2",
        {
          length: 1
        },
        display_customer_2
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_customer_2(req, res) {
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
        result = await customer_2_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await customer_2_Schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     title: element.title,
        //     first_name: element.first_name,
        //     address: element.address,
        //     dob: element.dob,
        //     gender: element.gender,
        //     country: element.country,
        //     state: element.state,
        //     anniversary: element.anniversary,
        //     email: element.email,
        //     city: element.city,
        //     pincode: element.pincode,
        //     isd_code: element.isd_code,
        //     mobile: element.mobile,
        //     pan_no: element.pan_no,
        //     gst_no: element.gst_no,
        //     password: element.password,
        //     reference: element.reference,
        //     customer_type: element.customer_type,
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        console.log("456");
        result = await customer_2_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await customer_2_Schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     title: element.title,
        //     first_name: element.first_name,
        //     address: element.address,
        //     dob: element.dob,
        //     gender: element.gender,
        //     country: element.country,
        //     state: element.state,
        //     anniversary: element.anniversary,
        //     email: element.email,
        //     city: element.city,
        //     pincode: element.pincode,
        //     isd_code: element.isd_code,
        //     mobile: element.mobile,
        //     pan_no: element.pan_no,
        //     gst_no: element.gst_no,
        //     password: element.password,
        //     reference: element.reference,
        //     customer_type: element.customer_type,
        //     agency_id: element.agency_id,
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

      const customer_2 = {
        customers: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all customer_2",
        {
          length: 1
        },
        customer_2
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_customer_2(req, res) {
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
        title: req.body.title,
        first_name: req.body.first_name,
        address: req.body.address,
        dob: req.body.dob,
        gender: req.body.gender,
        country: req.body.country,
        state: req.body.state,
        anniversary: req.body.anniversary,
        email: req.body.email,
        city: req.body.city,
        pincode: req.body.pincode,
        isd_code: req.body.isd_code,
        mobile: req.body.mobile,
        pan_no: req.body.pan_no,
        gst_no: req.body.gst_no,
        password: req.body.password,
        reference: req.body.reference,
        customer_type: req.body.customer_type,
        is_deleted: req.body.is_deleted
      };

      const update_customer_2 = await customer_2_Schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, Data);
      return this.sendJSONResponse(
        res,
        "update customer_2",
        {
          length: 1
        },
        update_customer_2
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_customer_2(req, res) {
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

      const delete_customer_2 = await customer_2_Schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete customer_2",
        {
          length: 1
        },
        delete_customer_2
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
