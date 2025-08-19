const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const ReminderSchema = require("../models/reminders.schema");
const userSchema = require("../models/usersSchema");
const mongoose = require("mongoose");

module.exports = class ReminderController extends BaseController {
  async createReminder(req, res) {
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
        remind_before: req.body.remind_before,
        type: req.body.type,
        reminder_date: req.body.reminder_date,
        reminder_via: req.body.reminder_via,
        reminder_hh: req.body.reminder_hh,
        reminder_mm: req.body.reminder_mm,
        reminder_period: req.body.reminder_period,
        reminder_note: req.body.reminder_note,
        lead_id: req.body.lead_id,
        created_by: req.body.created_by
      };
      const Add_hotel_type = new ReminderSchema(data);
      const Add_hotel_Type = await Add_hotel_type.save();
      return this.sendJSONResponse(
        res,
        "hotel_type add",
        {
          length: 1
        },
        Add_hotel_Type
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async displayReminder(req, res) {
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

      const display_hotel_type = await ReminderSchema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display hotel_type",
        {
          length: 1
        },
        display_hotel_type
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async displayReminderList(req, res) {
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
        // console.log("123");
        result = await ReminderSchema.aggregate([
          {
            $match: {
              $and: [
                { is_deleted: true },
                { agency_id: mongoose.Types.ObjectId(tokenData.id) },
                ...(!!req.query.lead_id ? [{ lead_id: mongoose.Types.ObjectId(req.query.lead_id) }] : [])
              ]
            }
          },
          {
            $sort: {
              _id: -1
            }
          }
        ]);
        // productPaginate1 = await ReminderSchema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     name: element.name,
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        console.log("456");
        result = await ReminderSchema.aggregate([
          {
            $match: {
              $and: [
                { is_deleted: { $ne: true } },
                { agency_id: mongoose.Types.ObjectId(tokenData.id) },
                ...(!!req.query.lead_id ? [{ lead_id: mongoose.Types.ObjectId(req.query.lead_id) }] : [])
              ]
            }
          },
          {
            $sort: {
              _id: -1
            }
          }
        ]);
        // productPaginate1 = await ReminderSchema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     name: element.name,
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

      const hotel_type = {
        reminders: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "hotel_type display",
        {
          length: 1
        },
        hotel_type
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async updateReminder(req, res) {
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
        remind_before: req.body.remind_before,
        type: req.body.type,
        reminder_date: req.body.reminder_date,
        reminder_via: req.body.reminder_via,
        reminder_hh: req.body.reminder_hh,
        reminder_mm: req.body.reminder_mm,
        reminder_period: req.body.reminder_period,
        reminder_note: req.body.reminder_note
        // lead_id: req.body.lead_id,
        // created_by: req.body.created_by,
        // is_deleted: req.body.is_deleted
      };

      const update_hotel_type = await ReminderSchema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, Data);
      return this.sendJSONResponse(
        res,
        "update hotel_type",
        {
          length: 1
        },
        update_hotel_type
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async deleteReminder(req, res) {
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

      const data = {
        is_deleted: true
      };

      const delete_hotel_type = await ReminderSchema.findByIdAndDelete({ _id: _id }, data);

      return this.sendJSONResponse(
        res,
        "delete hotel_type",
        {
          length: 1
        },
        delete_hotel_type
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
