const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const transfer_type_schema = require("../models/transfer_types.Schema");
const userSchema = require("../models/usersSchema");
const mongoose = require("mongoose");

module.exports = class transfer_type_Controller extends BaseController {
  async add_transfer_type(req, res) {
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
        name: req.body.name,
        is_source: req.body.is_source,
        is_destination: req.body.is_destination,
        is_vehicle_type: req.body.is_vehicle_type,
        is_vehicle_name: req.body.is_vehicle_name,
        is_remarks: req.body.is_remarks,
        is_units: req.body.is_units
      };
      const Add_transfer_type = new transfer_type_schema(data);
      const Add_Transfer_type = await Add_transfer_type.save();
      return this.sendJSONResponse(
        res,
        "transfer_type add",
        {
          length: 1
        },
        Add_Transfer_type
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_transfer_type(req, res) {
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

      const display_transfer_type = await transfer_type_schema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display transfer_type",
        {
          length: 1
        },
        display_transfer_type
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_transfer_type(req, res) {
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
        result = await transfer_type_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await transfer_type_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     name: element.name,
        //     agency_id: element.agency_id,
        //     is_source: element.is_source,
        //     is_destination: element.is_destination,
        //     is_vehicle_type: element.is_vehicle_type,
        //     is_vehicle_name: element.is_vehicle_name,
        //     is_remarks: element.is_remarks,
        //     is_units: element.is_units,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        console.log("456");
        result = await transfer_type_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await transfer_type_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     name: element.name,
        //     agency_id: element.agency_id,
        //     is_source: element.is_source,
        //     is_destination: element.is_destination,
        //     is_vehicle_type: element.is_vehicle_type,
        //     is_vehicle_name: element.is_vehicle_name,
        //     is_remarks: element.is_remarks,
        //     is_units: element.is_units,
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

      const transfer_type = {
        transfer_types: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "transfer_type display",
        {
          length: 1
        },
        transfer_type
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_transfer_type(req, res) {
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
        is_source: req.body.is_source,
        is_destination: req.body.is_destination,
        is_vehicle_type: req.body.is_vehicle_type,
        is_vehicle_name: req.body.is_vehicle_name,
        is_remarks: req.body.is_remarks,
        is_units: req.body.is_units,
        is_deleted: req.body.is_deleted
      };

      const update_transfer_type = await transfer_type_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update transfer_type",
        {
          length: 1
        },
        update_transfer_type
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_transfer_type(req, res) {
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

      const delete_transfer_type = await transfer_type_schema.findByIdAndUpdate({ _id: _id }, data);

      return this.sendJSONResponse(
        res,
        "delete transfer_type",
        {
          length: 1
        },
        delete_transfer_type
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
