const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const popular_hotel_schema = require("../models/popularhotelSchema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const fn = "popular_hotel";
module.exports = class popular_hotel_Controller extends BaseController {
  async add_popular_hotel(req, res) {
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
        destination_type: req.body.destination_type,
        destination: req.body.destination,
        // img: generateFilePathForDB(req.file),
        img: req.files.img[0].filename,
        header: req.body.header,
        sub_header: req.body.sub_header,
        is_featured: req.body.is_featured
      };
      res.send(data);
      const add_popular_hotel = new popular_hotel_schema(data);
      const Add_popular_hotel = await add_popular_hotel.save();

      // Add_popular_hotel.img = generateDownloadLink(Add_popular_hotel.img);

      return this.sendJSONResponse(
        res,
        "add popular_hotel ",
        {
          length: 1
        },
        Add_popular_hotel
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_popular_hotel(req, res) {
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

      const display_popular_hotel = await popular_hotel_schema.find({ agency_id: tokenData.id, _id: _id });

      // display_popular_hotel[0].img = generateFileDownloadLinkPrefix(req.localHostURL) + display_popular_hotel[0].img;
      display_popular_hotel[0].img = await image_url(fn, display_popular_hotel[0].img);
      return this.sendJSONResponse(
        res,
        "display  popular_hotel",
        {
          length: 1
        },
        display_popular_hotel
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_popular_hotel(req, res) {
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
        result = await popular_hotel_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await popular_hotel_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     destination_type: element.destination_type,
        //     agency_id: element.agency_id,
        //     destination: element.destination,
        //     header: element.header,
        //     sub_header: element.sub_header,
        //     img: element.img,
        //     is_featured: element.is_featured,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        // console.log("456");
        result = await popular_hotel_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await popular_hotel_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     destination_type: element.destination_type,
        //     agency_id: element.agency_id,
        //     destination: element.destination,
        //     header: element.header,
        //     sub_header: element.sub_header,
        //     img: element.img,
        //     is_featured: element.is_featured,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      }

      for (let i = 0; i < result.length; i++) {
        // result[i].img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].img;
        result[i].img = image_url(fn, result[i].img);
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

      const popular_hotel = {
        popular_hotels: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all popular_hotel",
        {
          length: 1
        },
        popular_hotel
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_popular_hotel(req, res) {
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
        header: req.body.header,
        // img: generateFilePathForDB(req.file),
        seo_url: req.body.seo_url,
        seo_title: req.body.seo_title,
        meta_keyword: req.body.meta_keyword,
        meta_description: req.body.meta_description,
        og_tag: req.body.og_tag,
        description: req.body.description,
        //
        destination_type: req.body.destination_type,
        destination: req.body.destination,
        // img: generateFilePathForDB(req.file),
        img: req.files?.img?.[0]?.filename,
        sub_header: req.body.sub_header,
        is_featured: req.body.is_featured
      };

      const update_popular_hotel = await popular_hotel_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update popular_hotel",
        {
          length: 1
        },
        update_popular_hotel
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_popular_hotel(req, res) {
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

      const delete_popular_hotel = await popular_hotel_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete popular_hotel",
        {
          length: 1
        },
        delete_popular_hotel
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
