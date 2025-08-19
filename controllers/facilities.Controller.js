const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const facilities_schema = require("../models/facilities.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const fn = "facilities";
module.exports = class facilities_Controller extends BaseController {
  async add_facilities(req, res) {
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
      // res.send(req.files.icon_img[0].filename)
      const data = {
        agency_id: tokenData.id,
        name: req.body.name,
        icon: req.body.icon,
        // icon_img: generateFilePathForDB(req.file),
        icon_img: req.files.icon_img[0].filename,
        category_type: req.body.category_type
      };

      const add_facilities = new facilities_schema(data);
      const Add_Facilities = await add_facilities.save();

      // Add_Facilities.icon_img = generateDownloadLink(Add_Facilities.icon_img);

      return this.sendJSONResponse(
        res,
        "add facilities ",
        {
          length: 1
        },
        Add_Facilities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_facilities(req, res) {
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

      const display_facilities = await facilities_schema.find({ agency_id: tokenData.id, _id: _id });

      // display_facilities[0].icon_img =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_facilities[0].icon_img;
      display_facilities[0].icon_img = image_url(fn, display_facilities[0].icon_img);
      return this.sendJSONResponse(
        res,
        "display  facilities",
        {
          length: 1
        },
        display_facilities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async display_all_facilities(req, res) {
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
  // let Data = [];
  //     let result;
  //     if (is_deleted === "true") {
  //       // console.log("123");
  //       result = await facilities_schema.aggregate([
  //         {
  //           $match: {
  //             $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
  //           }
  //         },
  //         {
  //            $lookup:{
  //                  from:"categories",
  //                  localField: "category_type",
  //                  foreignField: "_id",
  //                  as: "categories"
  //            }
  //         },{
  //           $addFields: {
  //             category_name: { $first: "$categories.name" }
  //           }
  //         },
  //         {
  //           $project: {
  //             _id: 1,
  //             name: 1,
  //             agency_id: 1,
  //             icon: 1,
  //             icon_img: 1,
  //             category_type: 1,
  //             category_name:1
  //             // categories:{
  //             //   name:1
  //             // }
  //           }
  //         }
  //       ]);
  //       productPaginate1 = await facilities_schema.aggregatePaginate(result, option);
  //       productPaginate1.docs.forEach((element) => {
  //         Data.push({
  //           _id: element._id,
  //           name: element.name,
  //           agency_id: element.agency_id,
  //           icon: element.icon,
  //           icon_img: element.icon_img,
  //           // category_type: element.category_type,
  //           category_name: element.category_name,
  //           category_type: element.category_type,
  //           is_deleted: element.is_deleted,
  //           createdAt: element.createdAt,
  //           updatedAt: element.updatedAt
  //         });
  //       });
  //     } else {
  //       // console.log("456");
  //       result = await facilities_schema.aggregate([
  //         {
  //           $match: {
  //             $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
  //           }
  //         },
  //          {
  //            $lookup:{
  //                  from:"categories",
  //                  localField: "category_type",
  //                  foreignField: "_id",
  //                  as: "categories"
  //            }
  //         },
  //         {
  //           $addFields: {
  //             category_name: { $first: "$categories.name" }
  //           }
  //         },
  //         {
  //           $project: {
  //             _id: 1,
  //             name: 1,
  //             agency_id: 1,
  //             icon: 1,
  //             icon_img: 1,
  //             category_type: 1,
  //             category_name:1
  //             // categories:{
  //             //   name:1
  //             // }
  //           }
  //         }
  //       ]);
  //       productPaginate1 = await facilities_schema.aggregatePaginate(result, option);
  //       productPaginate1.docs.forEach((element) => {
  //         Data.push({
  //           _id: element._id,
  //           name: element.name,
  //           agency_id: element.agency_id,
  //           icon: element.icon,
  //           icon_img: element.icon_img,
  //           category_type: element.category_type,
  //           // category_name: element.category_name,
  //           categories:{
  //           name: element.name
  //         },
  //           // header: element.header,
  //           // seo_url: element.seo_url,
  //           // seo_title: element.seo_title,
  //           // meta_keyword: element.meta_keyword,
  //           // meta_description: element.meta_description,
  //           // og_tag: element.og_tag,
  //           is_deleted: element.is_deleted,
  //           createdAt: element.createdAt,
  //           updatedAt: element.updatedAt
  //         });
  //       });
  //     }

  //     for (let i = 0; i < result.length; i++) {
  //       result[i].icon_img = generateFileDownloadLinkPrefix(req.localHostURL) + result[0].icon_img;
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

  //     const facilities = {
  //       facilitie: Data,
  //       pageInfo: pageInfo
  //     };
  //     return this.sendJSONResponse(
  //       res,
  //       "display all facilities",
  //       {
  //         length: 1
  //       },
  //       facilities
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async display_all_facilities(req, res) {
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
        result = await facilities_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $lookup: {
              from: "categories",
              localField: "category_type",
              foreignField: "_id",
              as: "categories"
            }
          },
          {
            $addFields: {
              category_name: { $first: "$categories.name" }
            }
          },
          {
            $project: {
              _id: 1,
              name: 1,
              agency_id: 1,
              icon: 1,
              icon_img: 1,
              category_type: 1,
              category_name: 1,
              is_deleted: 1
              // categories:{
              //   name:1
              // }
            }
          }
        ]);
      } else {
        // console.log("456");
        result = await facilities_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $lookup: {
              from: "categories",
              localField: "category_type",
              foreignField: "_id",
              as: "categories"
            }
          },
          {
            $addFields: {
              category_name: { $first: "$categories.name" }
            }
          },
          {
            $project: {
              _id: 1,
              name: 1,
              agency_id: 1,
              icon: 1,
              icon_img: 1,
              category_type: 1,
              category_name: 1,
              is_deleted: 1
              // categories:{
              //   name:1
              // }
            }
          }
        ]);
      }
      for (let i = 0; i < result.length; i++) {
        // result[i].icon_img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].icon_img;
        result[i].icon_img = await image_url(fn, result[i].icon_img);
      }

      const facilitie = {
        facilities: result
      };
      return this.sendJSONResponse(
        res,
        "displayfacilities",
        {
          length: 1
        },
        facilitie
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_facilities(req, res) {
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
        // icon_img: generateFilePathForDB(req.file),
        icon_img: req.files?.icon_img?.[0]?.filename,
        icon: req.body.icon,
        category_type: req.body.category_type,
        is_deleted: req.body.is_deleted
      };

      const update_facilities = await facilities_schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, Data, {
        new: true
      });

      update_facilities.icon_img = generateDownloadLink(update_facilities.icon_img);

      return this.sendJSONResponse(
        res,
        "update facilities",
        {
          length: 1
        },
        update_facilities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_facilities(req, res) {
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

      const delete_facilities = await facilities_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete facilities",
        {
          length: 1
        },
        delete_facilities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
