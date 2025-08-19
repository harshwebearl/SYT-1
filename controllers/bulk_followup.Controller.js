const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const bulk_followup_Schema = require("../models/bulk_followup.Schema");
const mongoose = require("mongoose");

module.exports = class bulk_followup_Controller extends BaseController {
  async add_bulk_followup(req, res) {
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
        lead_id: req.body.lead_id,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        allocated_to: req.body.allocated_to,
        service: req.body.service,
        source: req.body.source,
        stage: req.body.stage,
        status: req.body.status,
        email_send_on: req.body.email_send_on,
        no_of_email_send: req.body.no_of_email_send,
        sms_sent_on: req.body.sms_sent_on,
        no_of_sms_sent: req.body.no_of_sms_sent
      };
      const add_bulk_followup = new bulk_followup_Schema(data);
      const Add_bulk_followup = await add_bulk_followup.save();
      return this.sendJSONResponse(
        res,
        "add bulk_followup",
        {
          length: 1
        },
        Add_bulk_followup
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_bulk_followup(req, res) {
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

      const display_bulk_followup = await bulk_followup_Schema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display  bulk_followup",
        {
          length: 1
        },
        display_bulk_followup
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async display_all_bulk_followup(req, res) {
  //   try {
  //     // const is_deleted = req.query.is_deleted;

  //     const tokenData = req.userData;
  //     if (tokenData === "") {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }
  //     const userData = await userSchema.find({ _id: tokenData.id });
  //     if (userData[0].role !== "agency") {
  //       throw new Forbidden("you are not agency");
  //     }

  //     let { limit, page, is_deleted } = req.query;
  //     if ([null, undefined, ""].includes(page)) {
  //       page = 1;
  //     }
  //     if ([null, undefined, "", 1].includes(limit)) {
  //       limit = 50;
  //     }
  //     const option = {
  //       limit: limit,
  //       page: page
  //     };

  //     let productPaginate1;
  //     let Data = [];
  //     let result;
  //     if (is_deleted === "true") {
  //       console.log("123");
  //       result = await bulk_followup_Schema.aggregate([
  //         {
  //           $match: {
  //             $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
  //           }
  //         }
  //       ]);
  //       productPaginate1 = await bulk_followup_Schema.aggregatePaginate(result, option);
  //       productPaginate1.docs.forEach((element) => {
  //         Data.push({
  //           _id: element._id,
  //           title: element.title,
  //           first_name: element.first_name,
  //           address: element.address,
  //           dob: element.dob,
  //           gender: element.gender,
  //           country: element.country,
  //           state: element.state,
  //           anniversary: element.anniversary,
  //           email: element.email,
  //           city: element.city,
  //           pincode: element.pincode,
  //           is_code: element.is_code,
  //           mobile: element.mobile,
  //           pan_no: element.pan_no,
  //           gst_no: element.gst_no,
  //           password: element.password,
  //           reference: element.reference,
  //           customer_type: element.customer_type,
  //           agency_id: element.agency_id,
  //           is_deleted: element.is_deleted,
  //           createdAt: element.createdAt,
  //           updatedAt: element.updatedAt
  //         });
  //       });
  //     } else {
  //       // console.log("456");
  //       result = await bulk_followup_Schema.aggregate([
  //         {
  //           $match: {
  //             $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
  //           }
  //         }
  //       ]);
  //       productPaginate1 = await bulk_followup_Schema.aggregatePaginate(result, option);
  //       productPaginate1.docs.forEach((element) => {
  //         Data.push({
  //           _id: element._id,
  //           title: element.title,
  //           first_name: element.first_name,
  //           address: element.address,
  //           dob: element.dob,
  //           gender: element.gender,
  //           country: element.country,
  //           state: element.state,
  //           anniversary: element.anniversary,
  //           email: element.email,
  //           city: element.city,
  //           pincode: element.pincode,
  //           is_code: element.is_code,
  //           mobile: element.mobile,
  //           pan_no: element.pan_no,
  //           gst_no: element.gst_no,
  //           password: element.password,
  //           reference: element.reference,
  //           customer_type: element.customer_type,
  //           agency_id: element.agency_id,
  //           is_deleted: element.is_deleted,
  //           createdAt: element.createdAt,
  //           updatedAt: element.updatedAt
  //         });
  //       });
  //     }

  //     const pageInfo = {};
  //     pageInfo.totalDocs = productPaginate1.totalDocs;
  //     pageInfo.limit = productPaginate1.limit;
  //     pageInfo.page = productPaginate1.page;
  //     pageInfo.totalPages = productPaginate1.totalDocs;
  //     pageInfo.pagingCounter = productPaginate1.pagingCounter;
  //     pageInfo.hasPrevPage = productPaginate1.hasPrevPage;
  //     pageInfo.hasNextPage = productPaginate1.hasNextPage;
  //     pageInfo.prevPage = productPaginate1.prevPage;
  //     pageInfo.nextPage = productPaginate1.nextPage;

  //     const bulk_followup = {
  //       customers: Data,
  //       pageInfo: pageInfo
  //     };

  //     return this.sendJSONResponse(
  //       res,
  //       "display all bulk_followup",
  //       {
  //         length: 1
  //       },
  //       bulk_followup
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async display_all_bulk_followup(req, res) {
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

      let result;
      if (is_deleted === "true") {
        // console.log("123");
        result = await bulk_followup_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $lookup: {
              from: "services_2",
              localField: "service",
              foreignField: "_id",
              as: "services"
            }
          },
          {
            $lookup: {
              from: "sources",
              localField: "source",
              foreignField: "_id",
              as: "sources"
            }
          },
          {
            $lookup: {
              from: "members",
              localField: "allocated_to",
              foreignField: "_id",
              as: "members"
            }
          }
        ]);
      } else {
        console.log("456");
        result = await bulk_followup_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $lookup: {
              from: "services_2",
              localField: "service",
              foreignField: "_id",
              as: "services"
            }
          },
          {
            $lookup: {
              from: "sources",
              localField: "source",
              foreignField: "_id",
              as: "sources"
            }
          },
          {
            $lookup: {
              from: "members",
              localField: "allocated_to",
              foreignField: "_id",
              as: "members"
            }
          }
        ]);
      }

      const bulk_followups = {
        bulk_followup: result
      };

      return this.sendJSONResponse(
        res,
        "update bulk_followup",
        {
          length: 1
        },
        bulk_followups
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_bulk_followup(req, res) {
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
        lead_id: req.body.lead_id,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        allocated_to: req.body.allocated_to,
        service: req.body.service,
        source: req.body.source,
        stage: req.body.stage,
        status: req.body.status,
        email_send_on: req.body.email_send_on,
        no_of_email_send: req.body.no_of_email_send,
        sms_sent_on: req.body.sms_sent_on,
        no_of_sms_sent: req.body.no_of_sms_sent,
        is_deleted: req.body.is_deleted
      };

      const update_bulk_followup = await bulk_followup_Schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update bulk_followup",
        {
          length: 1
        },
        update_bulk_followup
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_bulk_followup(req, res) {
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

      const delete_bulk_followup = await bulk_followup_Schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete bulk_followup",
        {
          length: 1
        },
        delete_bulk_followup
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
