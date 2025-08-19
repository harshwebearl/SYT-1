const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const customer_group_Schema = require("../models/customer_group_Schema");
const mongoose = require("mongoose");

module.exports = class customer_group_Controller extends BaseController {
  async add_customer_group(req, res) {
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
        customers_list: req.body.customers_list
      };
      const add_customer_group = new customer_group_Schema(data);
      const Add_customer_group = await add_customer_group.save();
      return this.sendJSONResponse(
        res,
        "add customer_group",
        {
          length: 1
        },
        Add_customer_group
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_customer_group(req, res) {
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

      const display_customer_group = await customer_group_Schema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display  customer_group",
        {
          length: 1
        },
        display_customer_group
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async display_all_customer_group(req, res) {
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
  //       result = await customer_group_Schema.aggregate([
  //         {
  //           $match: {
  //             $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
  //           }
  //         }
  //       ]);
  //       productPaginate1 = await customer_group_Schema.aggregatePaginate(result, option);
  //       productPaginate1.docs.forEach((element) => {
  //         Data.push({
  //           _id: element._id,
  //           name: element.name,
  //           agency_id: element.agency_id,
  //           customers_list: req.body.customers_list,
  //           is_deleted: element.is_deleted,
  //           createdAt: element.createdAt,
  //           updatedAt: element.updatedAt
  //         });
  //       });
  //     } else {
  //       console.log("456");
  //       result = await customer_group_Schema.aggregate([
  //         {
  //           $match: {
  //             $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
  //           }
  //         }
  //       ]);
  //       productPaginate1 = await customer_group_Schema.aggregatePaginate(result, option);
  //       productPaginate1.docs.forEach((element) => {
  //         Data.push({
  //           _id: element._id,
  //           name: element.name,
  //           agency_id: element.agency_id,
  //           customers_list: req.body.customers_list,
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

  //     const customer_group = {
  //       customer_groups: Data,
  //       pageInfo: pageInfo
  //     };

  //     return this.sendJSONResponse(
  //       res,
  //       "display all customer_group",
  //       {
  //         length: 1
  //       },
  //       customer_group
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async display_all_customer_group(req, res) {
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
        console.log("123");
        result = await customer_group_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $lookup: {
              from: "customer_2",
              localField: "customers_list",
              foreignField: "_id",
              as: "customer_details"
            }
          }
        ]);
      } else {
        console.log("456");
        result = await customer_group_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $lookup: {
              from: "customer_2",
              localField: "customers_list",
              foreignField: "_id",
              as: "customer_details"
            }
          }
        ]);
      }

      const customer_groups = {
        customer_group: result
      };

      return this.sendJSONResponse(
        res,
        "update customer_group",
        {
          length: 1
        },
        customer_groups
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_customer_group(req, res) {
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
        customers_list: req.body.customers_list,
        is_deleted: req.body.is_deleted
      };

      const update_customer_group = await customer_group_Schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update customer_group",
        {
          length: 1
        },
        update_customer_group
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_customer_group(req, res) {
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

      const delete_customer_group = await customer_group_Schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete customer_group",
        {
          length: 1
        },
        delete_customer_group
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
