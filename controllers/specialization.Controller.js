const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const specialization_schema = require("../models/specializationsSchma");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const fn = "specialization";
module.exports = class specialization_Controller extends BaseController {
  async add_specialization(req, res) {
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
        header: req.body.header,
        // img: generateFilePathForDB(req.file),
        img: req.files.img[0].filename,
        seo_url: req.body.seo_url,
        seo_title: req.body.seo_title,
        meta_keyword: req.body.meta_keyword,
        meta_description: req.body.meta_description,
        og_tag: req.body.og_tag,
        description: req.body.description,
        is_featured: req.body.is_featured,
        is_destination: req.body.is_destination
      };

      const add_specialization = new specialization_schema(data);
      const Add_specialization = await add_specialization.save();

      // Add_specialization.img = generateDownloadLink(Add_specialization.img);

      return this.sendJSONResponse(
        res,
        "add specialization ",
        {
          length: 1
        },
        Add_specialization
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_specialization(req, res) {
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

      const display_specialization = await specialization_schema.find({ agency_id: tokenData.id, _id: _id });

      // display_specialization[0].img = generateFileDownloadLinkPrefix(req.localHostURL) + display_specialization[0].img;
      display_specialization[0].img = image_url(fn, display_specialization[0].img);

      return this.sendJSONResponse(
        res,
        "display  specialization",
        {
          length: 1
        },
        display_specialization
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_specialization(req, res) {
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
        result = await specialization_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await specialization_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     name: element.name,
        //     agency_id: element.agency_id,
        //     header: element.header,
        //     seo_url: element.seo_url,
        //     seo_title: element.seo_title,
        //     meta_keyword: element.meta_keyword,
        //     meta_description: element.meta_description,
        //     og_tag: element.og_tag,
        //     description: element.description,
        //     is_featured: element.is_featured,
        //     is_destination: element.is_destination,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        // console.log("456");
        result = await specialization_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await specialization_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     name: element.name,
        //     agency_id: element.agency_id,
        //     header: element.header,
        //     seo_url: element.seo_url,
        //     seo_title: element.seo_title,
        //     meta_keyword: element.meta_keyword,
        //     meta_description: element.meta_description,
        //     og_tag: element.og_tag,
        //     description: element.description,
        //     is_featured: element.is_featured,
        //     is_destination: element.is_destination,
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

      const specialization = {
        specializations: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all specialization",
        {
          length: 1
        },
        specialization
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_specialization(req, res) {
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
        img: req.files?.img?.[0]?.filename,
        seo_url: req.body.seo_url,
        seo_title: req.body.seo_title,
        meta_keyword: req.body.meta_keyword,
        meta_description: req.body.meta_description,
        og_tag: req.body.og_tag,
        description: req.body.description,
        is_featured: req.body.is_featured,
        is_destination: req.body.is_destination,
        is_deleted: req.body.is_deleted
      };

      const update_specialization = await specialization_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update specialization",
        {
          length: 1
        },
        update_specialization
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_specialization(req, res) {
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

      const delete_specialization = await specialization_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete specialization",
        {
          length: 1
        },
        delete_specialization
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
