const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const supplier_payment_Schema = require("../models/supplier_payments.Schema");
const mongoose = require("mongoose");
const agencySchema = require("../models/Agency_personalSchema");

module.exports = class supplier_payment_Controller extends BaseController {
  async add_supplier_payment(req, res) {
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
        ...req.body
      };
      const add_supplier_payment = new supplier_payment_Schema(data);
      const Add_supplier_payment = await add_supplier_payment.save();
      return this.sendJSONResponse(
        res,
        "add supplier_payment",
        {
          length: 1
        },
        Add_supplier_payment
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_supplier_payment(req, res) {
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

      // const userDetails = await agencySchema.find({ user_id: tokenData.id }).populate({
      //   path: "user_id",
      //   // match: {
      //   //   vendor_id: mongoose.Types.ObjectId(tokenData.id)
      //   // },
      //   // populate: {
      //   //   path: "product_id"
      //   // }
      // })
      // console.log(userDetails)

      const display_supplier_payment = await supplier_payment_Schema.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(_id),
            agency_id: mongoose.Types.ObjectId(tokenData.id)
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
            from: "suppliers",
            localField: "supplier",
            foreignField: "_id",
            as: "suppliers"
          }
        },
        // !CUSTOM PIPELINE
        { $match: { lead_id: { $exists: true } } },
        {
          $lookup: {
            from: "invoices",
            localField: "lead_id",
            foreignField: "lead_id",
            as: "invoices"
          }
        }
        // {
        //   $lookup: {
        //     from: "invoices",
        //     // localField: "_id",
        //     // foreignField: "lead_id",
        //     // let: { local_id: '$lead_id' },
        //     // let: { local_id: { $toObjectId: "$items.paramValue" } },
        //     let: { local_id: { $toObjectId: "$lead_id" } },
        //     as: "invoices",
        //     pipeline: [
        //       // { $match: { $expr: { $eq: ['$$local_id', '$lead_id'] } } },
        //       {
        //         $match: {
        //           $expr: {
        //             $and: [
        //               { $eq: ['$$local_id', "$lead_id"] },
        //               // { $gte: ["$startDate", ISODate("2020-08-01T00:00:00.000Z")] },
        //               // { $lte: ["$endDate", ISODate("2020-08-31T23:59:59.999Z")] }
        //             ]
        //           }
        //         }
        //       },
        //       { $sort: { 'createdAt': 1 } },
        //       // { $limit: 500 }
        //       // { $sort: { _id: -1 } },
        //       { $limit: 1 }
        //     ],
        //     // pipeline: [
        //     //   { $sort: -1 },
        //     //   { $limit: 1 }
        //     // ]
        //   }
        // },
      ]);

      // const display_supplier_payment = await supplier_payment_Schema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display  supplier_payment",
        {
          length: 1
        },
        display_supplier_payment
      );
    } catch (error) {
      console.log(error.stack);
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_supplier_payment(req, res) {
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

      const { is_deleted, only_unallocated } = req.query;
      const pipeline = [];
      pipeline.push(
        {
          $match: {
            $and: [
              { agency_id: mongoose.Types.ObjectId(tokenData.id) },
              { is_deleted: !!req.query.is_deleted },
              ...(!!req.query.stage ? [{ stage: req.query.stage }] : []),
              ...(!!req.query.customer_type ? [{ customer_type: req.query.customer_type }] : []),
              ...(!!req.query.only_unallocated ? [{ allocated_to: { $exists: false } }] : [])
            ]
          }
        },
        {
          $sort: {
            _id: -1
          }
        }
      );

      let result;
      result = await supplier_payment_Schema.aggregate([
        {
          $match: {
            $and: [
              { is_deleted: true },
              { status: { $ne: "paid" } },
              { agency_id: mongoose.Types.ObjectId(tokenData.id) },
              ...(!!req.query.lead_id ? [{ lead_id: mongoose.Types.ObjectId(req.query.lead_id) }] : [])
            ]
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
            from: "suppliers",
            localField: "supplier",
            foreignField: "_id",
            as: "suppliers"
          }
        },
        {
          $sort: {
            _id: -1
          }
        }
      ]);
      result = await supplier_payment_Schema.aggregate([
        {
          $match: {
            $and: [
              { is_deleted: { $ne: true } },
              { status: { $ne: "paid" } },
              { agency_id: mongoose.Types.ObjectId(tokenData.id) },
              ...(!!req.query.lead_id ? [{ lead_id: mongoose.Types.ObjectId(req.query.lead_id) }] : [])
            ]
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
            from: "suppliers",
            localField: "supplier",
            foreignField: "_id",
            as: "suppliers"
          }
        },
        {
          $sort: {
            _id: -1
          }
        }
      ]);

      const supplier_payment = {
        supplier_payments: result
        // supplier_payments: Data,
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all supplier_payment",
        {
          length: 1
        },
        supplier_payment
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_supplier_payment(req, res) {
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
        ...req.body,
        agency_id: tokenData.id,
        is_deleted: req.body.is_deleted
      };

      const update_supplier_payment = await supplier_payment_Schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update room type",
        {
          length: 1
        },
        update_supplier_payment
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_supplier_payment(req, res) {
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

      const delete_supplier_payment = await supplier_payment_Schema.findByIdAndDelete({ _id: _id }, Data);
      // const delete_supplier_payment = await supplier_payment_Schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete room type",
        {
          length: 1
        },
        delete_supplier_payment
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
