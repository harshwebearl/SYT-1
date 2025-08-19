const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cms_destination_related_packages_Schema = require("../models/cms_destination_related_packages.Schema");
const mongoose = require("mongoose");

module.exports = class cms_destination_related_packages_Controller extends BaseController {
  async add_cms_destination_related_packages(req, res) {
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
        destination_id: req.body.destination_id,
        packages: req.body.packages
      };
      const add_cms_destination_related_packages = new cms_destination_related_packages_Schema(data);
      const Add_cms_destination_related_packages = await add_cms_destination_related_packages.save();
      return this.sendJSONResponse(
        res,
        "add cms_destination_related_packages",
        {
          length: 1
        },
        Add_cms_destination_related_packages
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cms_destination_related_packages(req, res) {
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

      const display_cms_destination_related_packages = await cms_destination_related_packages_Schema.find({
        agency_id: tokenData.id,
        _id: _id
      });

      return this.sendJSONResponse(
        res,
        "display  cms_destination_related_packages",
        {
          length: 1
        },
        display_cms_destination_related_packages
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  //   async display_all_cms_destination_related_packages(req, res) {
  //     try {
  //       // const is_deleted = req.query.is_deleted;

  //       const tokenData = req.userData;
  //       if (tokenData === "") {
  //         return res.status(401).json({
  //           message: "Auth fail"
  //         });
  //       }
  //       const userData = await userSchema.find({ _id: tokenData.id });
  //       if (userData[0].role !== "agency") {
  //         throw new Forbidden("you are not agency");
  //       }

  //       let { limit, page, is_deleted } = req.query;
  //       if ([null, undefined, ""].includes(page)) {
  //         page = 1;
  //       }
  //       if ([null, undefined, "", 1].includes(limit)) {
  //         limit = 50;
  //       }
  //       const option = {
  //         limit: limit,
  //         page: page
  //       };

  //       let productPaginate1;
  //       let Data = [];
  //       let result;
  //       if (is_deleted === "true") {
  //         console.log("123");
  //         result = await cms_destination_related_packages_Schema.aggregate([
  //           {
  //             $match: {
  //               $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
  //             }
  //           }
  //         ]);
  //         productPaginate1 = await cms_destination_related_packages_Schema.aggregatePaginate(result, option);
  //         productPaginate1.docs.forEach((element) => {
  //           Data.push({
  //             _id: element._id,
  //             name: element.name,
  //             agency_id: element.agency_id,
  //             is_deleted: element.is_deleted,
  //             createdAt: element.createdAt,
  //             updatedAt: element.updatedAt
  //           });
  //         });
  //       } else {
  //         console.log("456");
  //         result = await cms_destination_related_packages_Schema.aggregate([
  //           {
  //             $match: {
  //               $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
  //             }
  //           }
  //         ]);
  //         productPaginate1 = await cms_destination_related_packages_Schema.aggregatePaginate(result, option);
  //         productPaginate1.docs.forEach((element) => {
  //           Data.push({
  //             _id: element._id,
  //             name: element.name,
  //             agency_id: element.agency_id,
  //             is_deleted: element.is_deleted,
  //             createdAt: element.createdAt,
  //             updatedAt: element.updatedAt
  //           });
  //         });
  //       }

  //       const pageInfo = {};
  //       pageInfo.totalDocs = productPaginate1.totalDocs;
  //       pageInfo.limit = productPaginate1.limit;
  //       pageInfo.page = productPaginate1.page;
  //       pageInfo.totalPages = productPaginate1.totalDocs;
  //       pageInfo.pagingCounter = productPaginate1.pagingCounter;
  //       pageInfo.hasPrevPage = productPaginate1.hasPrevPage;
  //       pageInfo.hasNextPage = productPaginate1.hasNextPage;
  //       pageInfo.prevPage = productPaginate1.prevPage;
  //       pageInfo.nextPage = productPaginate1.nextPage;

  //       const cms_destination_related_packages = {
  //         room_categorie: Data,
  //         pageInfo: pageInfo
  //       };

  //       return this.sendJSONResponse(
  //         res,
  //         "display all categories_Schema",
  //         {
  //           length: 1
  //         },
  //         cms_destination_related_packages
  //       );
  //     } catch (error) {
  //       if (error instanceof NotFound) {
  //         console.log(error); // throw error;
  //       }
  //       return this.sendErrorResponse(req, res, error);
  //     }
  //   }

  async display_all_cms_destination_related_packages(req, res) {
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
        result = await cms_destination_related_packages_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $lookup: {
              from: "cms_destinations",
              localField: "destination_id",
              foreignField: "_id",
              as: "destination"
            }
          },
          {
            $lookup: {
              from: "package1",
              localField: "packages",
              foreignField: "_id",
              as: "_packages"
            }
          }
        ]);
      } else {
        // console.log("456");
        result = await cms_destination_related_packages_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $lookup: {
              from: "cms_destinations",
              localField: "destination_id",
              foreignField: "_id",
              as: "destination"
            }
          },
          {
            $lookup: {
              from: "package1",
              localField: "packages",
              foreignField: "_id",
              as: "_packages"
            }
          }
        ]);
      }

      const cms_destination_related_package = {
        cms_destination_related_packages: result
      };

      return this.sendJSONResponse(
        res,
        "display cms_destination_related_packages",
        {
          length: 1
        },
        cms_destination_related_package
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_cms_destination_related_packages(req, res) {
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
        is_deleted: req.body.is_deleted
      };

      const update_cms_destination_related_packages = await cms_destination_related_packages_Schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update cms_destination_related_packages",
        {
          length: 1
        },
        update_cms_destination_related_packages
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cms_destination_related_packages(req, res) {
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

      const delete_cms_destination_related_packages = await cms_destination_related_packages_Schema.findByIdAndUpdate(
        { _id: _id },
        Data
      );

      return this.sendJSONResponse(
        res,
        "delete cms_destination_related_packages",
        {
          length: 1
        },
        delete_cms_destination_related_packages
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
