const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const Transactionschema = require("../models/TransactionSchema");
const userSchema = require("../models/customerSchema");
const agencySchema = require("../models/Agency_personalSchema");
const mongoose = require("mongoose");
const Bidschema = require("../models/bidSchema");

module.exports = class TransactionController extends BaseController {
  async AddTransactonData(req, res) {
    try {
      const tokenData = req.userData;
      const adminData = await userSchema.find({ _id: tokenData.id });
      if (adminData.length === 0) {
        throw new Forbidden("you are not user");
      }
      const data = {
        user_id: tokenData.id,
        custom_requirement_id: req.body.custom_requirement_id,
        bid_id: req.body.bid_id,
        trnsaction_id: req.body.trnsaction_id,
        room_id: req.body.room_id,
        status: req.body.status,
        amount: req.body.amount
      };
      const addTransactonData = new Transactionschema(data);
      const AddTransactonData = await addTransactonData.save();

      return this.sendJSONResponse(
        res,
        "Add Transaction data",
        {
          length: 1
        },
        AddTransactonData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async DisplayUserTransactions(req, res) {
    try {
      const tokenData = req.userData;
      const adminData = await userSchema.find({ _id: tokenData.id });
      if (adminData.length === 0) {
        throw new Forbidden("you are not user");
      }
      const DisplayUserTransactions = await Transactionschema.find({ user_id: tokenData.id });
      return this.sendJSONResponse(
        res,
        "Display Transaction",
        {
          length: 1
        },
        DisplayUserTransactions
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async AgencyDisplayUserTransection(req, res) {
    try {
      const tokenData = req.userData;
      const adminData = await agencySchema.find({ _id: tokenData.id });
      if (adminData.length === 0) {
        throw new Forbidden("you are not agency");
      }
      const AgencyDisplayUserTransection = await Bidschema.aggregate([
        {
          $match: {
            agency_id: mongoose.Types.ObjectId(tokenData.id)
          }
        },
        {
          $lookup: {
            from: "transactions",
            localField: "_id",
            foreignField: "bid_id",
            as: "Transactions"
          }
        },
        {
          $match: {
            Transactions: { $ne: [] }
          }
        },
        {
          $project: {
            _id: 0,
            Transactions: {
              _id: 1,
              user_id: 1,
              custom_requirement_id: 1,
              bid_id: 1,
              trnsaction_id: 1,
              status: 1,
              amount: 1,
              createdAt: 1,
              updatedAt: 1
            }
          }
        }
      ]);
      return this.sendJSONResponse(
        res,
        "Display user Transaction",
        {
          length: 1
        },
        AgencyDisplayUserTransection
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async updateTransactionData(req, res) {
    try {
      const _id = req.query._id;
      const tokenData = req.userData;
      const adminData = await userSchema.find({ _id: tokenData.id });
      if (adminData.length === 0) {
        throw new Forbidden("you are not user");
      }
      const data = {
        status: req.body.status
      };
      const updateTransactionData = await Transactionschema.updateOne({ _id: _id, user_id: tokenData.id }, data);
      return this.sendJSONResponse(
        res,
        "Display user Transaction",
        {
          length: 1
        },
        updateTransactionData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async DeleteTransactionData(req, res) {
    try {
      const _id = req.query._id;
      const tokenData = req.userData;
      const adminData = await userSchema.find({ _id: tokenData.id });
      if (adminData.length === 0) {
        throw new Forbidden("you are not user");
      }
      const DeleteTransactionData = await Transactionschema.findByIdAndDelete({ _id: _id, user_id: tokenData.id });
      return this.sendJSONResponse(
        res,
        " Delete Transaction",
        {
          length: 1
        },
        DeleteTransactionData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
