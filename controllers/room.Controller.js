const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const room_schema = require("../models/rooms.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const fn = "room";
module.exports = class room_Controller extends BaseController {
  async add_room(req, res) {
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
        hotel: req.body.hotel,
        room_type: req.body.room_type,
        meal_plan: req.body.meal_plan,
        // thumb_img: req.files?.thumb_img?.map((file) => generateFilePathForDB(file))?.[0],
        // banner_img: req.files?.banner_img?.map((file) => generateFilePathForDB(file))?.[0],
        thumb_img: req.files.thumb_img[0].filename,
        banner_img: req.files.banner_img[0].filename,
        currency: req.body.currency,
        max_allowed_adults: req.body.max_allowed_adults,
        base_allowed_adults: req.body.base_allowed_adults,
        max_allowed_children: req.body.max_allowed_children,
        base_allowed_children: req.body.base_allowed_children,
        car: req.body.car,
        description: req.body.description,
        pricing: JSON.parse(req.body.pricing)
      };

      const add_room = new room_schema(data);
      const Add_room = await add_room.save();
      console.log(Add_room);
      Add_room.thumb_img = generateDownloadLink(Add_room.thumb_img);
      Add_room.banner_img = generateDownloadLink(Add_room.banner_img);
      // Add_room.currency_img = generateDownloadLink(Add_room.currency_img);

      // Add_room.icon_img = generateDownloadLink(Add_room.icon_img);

      return this.sendJSONResponse(
        res,
        "Add room",
        {
          length: 1
        },
        Add_room
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_room(req, res) {
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

      const display_room = await room_schema.find({ agency_id: tokenData.id, _id: _id });

      // display_room[0].thumb_img = generateFileDownloadLinkPrefix(req.localHostURL) + display_room[0].thumb_img;
      // display_room[0].banner_img = generateFileDownloadLinkPrefix(req.localHostURL) + display_room[0].banner_img;
      display_room[0].thumb_img = await image_url(fn, display_room[0].thumb_img);
      display_room[0].banner_img = await image_url(fn, display_room[0].banner_img);
      // display_room[0].currency_img = generateFileDownloadLinkPrefix(req.localHostURL) + display_room[0].currency_img;

      return this.sendJSONResponse(
        res,
        "display  room",
        {
          length: 1
        },
        display_room
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async display_all_room(req, res) {
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
  //       // console.log("123");
  //       result = await room_schema.aggregate([
  //         {
  //           $match: {
  //             $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
  //           }
  //         }
  //       ]);
  //       productPaginate1 = await room_schema.aggregatePaginate(result, option);
  //       productPaginate1.docs.forEach((element) => {
  //         Data.push({
  //           _id: element._id,
  //           agency_id: element.id,
  //           hotel: element.hotel,
  //           room_type: element.room_type,
  //           meal_plan: element.meal_plan,
  //           thumb_img: element.thumb_img,
  //           banner_img: element.banner_img,
  //           currency_img: element.currency_img,
  //           max_allowed_adults: element.max_allowed_adults,
  //           base_allowed_adults: element.base_allowed_adults,
  //           max_allowed_children: element.max_allowed_children,
  //           base_allowed_children: element.base_allowed_children,
  //           is_deleted: element.is_deleted,
  //           car: element.car,
  //           description: element.description,
  //           pricing: {
  //             from_date: element.pricing.from_date,
  //             to_date: element.pricing.to_date,
  //             base_price: element.pricing.base_price,
  //             per_adult_extra_price: element.pricing.per_adult_extra_price,
  //             per_child_extra_price: element.pricing.per_child_extra_price,
  //             per_child_wb_extra_price: element.pricing.per_child_wb_extra_price
  //           }
  //         });
  //       });
  //     } else {
  //       // console.log("456");
  //       result = await room_schema.aggregate([
  //         {
  //           $match: {
  //             $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
  //           }
  //         }
  //       ]);
  //       productPaginate1 = await room_schema.aggregatePaginate(result, option);
  //       productPaginate1.docs.forEach((element) => {
  //         Data.push({
  //           _id: element._id,
  //           agency_id: element.id,
  //           hotel: element.hotel,
  //           room_type: element.room_type,
  //           meal_plan: element.meal_plan,
  //           thumb_img: element.thumb_img,
  //           banner_img: element.banner_img,
  //           currency_img: element.currency_img,
  //           max_allowed_adults: element.max_allowed_adults,
  //           base_allowed_adults: element.base_allowed_adults,
  //           max_allowed_children: element.max_allowed_children,
  //           base_allowed_children: element.base_allowed_children,
  //           is_deleted: element.is_deleted,
  //           car: element.car,
  //           description: element.description,
  //           pricing: {
  //             from_date: element.pricing.from_date,
  //             to_date: element.pricing.to_date,
  //             base_price: element.pricing.base_price,
  //             per_adult_extra_price: element.pricing.per_adult_extra_price,
  //             per_child_extra_price: element.pricing.per_child_extra_price,
  //             per_child_wb_extra_price: element.pricing.per_child_wb_extra_price
  //           }
  //         });
  //       });
  //     }
  //     for (let i = 0; i < Data.length; i++) {
  //       Data[i].thumb_img = generateFileDownloadLinkPrefix(req.localHostURL) + Data[i].thumb_img;
  //     }
  //     for (let i = 0; i < Data.length; i++) {
  //       Data[i].banner_img = generateFileDownloadLinkPrefix(req.localHostURL) + Data[i].banner_img;
  //     }
  //     for (let i = 0; i < Data.length; i++) {
  //       Data[i].currency_img = generateFileDownloadLinkPrefix(req.localHostURL) + Data[i].currency_img;
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

  //     const room = {
  //       rooms: Data,
  //       pageInfo: pageInfo
  //     };

  //     return this.sendJSONResponse(
  //       res,
  //       "display all room",
  //       {
  //         length: 1
  //       },
  //       room
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async display_all_room(req, res) {
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
        result = await room_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $lookup: {
              from: "hotels",
              localField: "hotel",
              foreignField: "_id",
              as: "hotels"
            }
          },
          {
            $lookup: {
              from: "room_types",
              localField: "room_type",
              foreignField: "_id",
              as: "room_types"
            }
          },
          {
            $lookup: {
              from: "meal_plans",
              localField: "meal_plan",
              foreignField: "_id",
              as: "meal_plans"
            }
          }
        ]);
      } else {
        // console.log("456");
        result = await room_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $lookup: {
              from: "hotels",
              localField: "hotel",
              foreignField: "_id",
              as: "hotels"
            }
          },
          {
            $lookup: {
              from: "room_types",
              localField: "room_type",
              foreignField: "_id",
              as: "room_types"
            }
          },
          {
            $lookup: {
              from: "meal_plans",
              localField: "meal_plan",
              foreignField: "_id",
              as: "meal_plans"
            }
          }
        ]);
      }
      for (let i = 0; i < result.length; i++) {
        // result[i].thumb_img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].thumb_img;
        result[i].thumb_img = await image_url(fn, result[i].thumb_img);
      }
      for (let i = 0; i < result.length; i++) {
        // result[i].banner_img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].banner_img;
        result[i].banner_img = await image_url(fn, result[i].banner_img);
      }
      // for (let i = 0; i < result.length; i++) {
      //   result[i].currency_img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].currency_img;
      // }

      const rooms = {
        room: result
      };
      return this.sendJSONResponse(
        res,
        "display  room",
        {
          length: 1
        },
        rooms
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_room(req, res) {
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
        hotel: req.body.hotel,
        room_type: req.body.room_type,
        meal_plan: req.body.meal_plan,
        // thumb_img: req.files?.thumb_img?.map((file) => generateFilePathForDB(file))?.[0],
        // banner_img: req.files?.banner_img?.map((file) => generateFilePathForDB(file))?.[0],
        thumb_img: req.files?.thumb_img?.[0]?.filename,
        banner_img: req.files?.banner_img?.[0]?.filename,
        currency: req.body.currency,
        max_allowed_adults: req.body.max_allowed_adults,
        base_allowed_adults: req.body.base_allowed_adults,
        max_allowed_children: req.body.max_allowed_children,
        base_allowed_children: req.body.base_allowed_children,
        car: req.body.car,
        description: req.body.description,
        pricing: JSON.parse(req.body.pricing),
        is_deleted: req.body.is_deleted
      };

      const update_room = await room_schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, Data);
      return this.sendJSONResponse(
        res,
        "update room",
        {
          length: 1
        },
        update_room
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_room(req, res) {
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

      const delete_room = await room_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete room",
        {
          length: 1
        },
        delete_room
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
