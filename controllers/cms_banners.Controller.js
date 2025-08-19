const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cms_banners_schema = require("../models/cms_banners_schema");
const mongoose = require("mongoose");
const image_url = require("../update_url_path.js");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const fn = "cms_banners";
module.exports = class cms_banners_Controller extends BaseController {
  async add_cms_banners(req, res) {
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
        heading: req.body.heading,
        url: req.body.url,
        description: req.body.description,
        status: req.body.status,
        // image: generateFilePathForDB(req.file)
        image: req.files.image[0].filename
      };

      const add_cms_banners = new cms_banners_schema(data);
      const Add_cms_banners = await add_cms_banners.save();
      console.log(Add_cms_banners);

      // Add_cms_banners[0].image = generateFileDownloadLinkPrefix(req.localHostURL) +Add_cms_banners[0].image

      return this.sendJSONResponse(
        res,
        "add cms_banners ",
        {
          length: 1
        },
        Add_cms_banners
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cms_banners(req, res) {
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

      const display_cms_banners = await cms_banners_schema.find({ agency_id: tokenData.id, _id: _id });

      // display_cms_banners[0].image = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_banners[0].image;
      display_cms_banners[0].image = await image_url(fn, display_cms_banners[0].image);

      return this.sendJSONResponse(
        res,
        "display  cms_banners",
        {
          length: 1
        },
        display_cms_banners
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_cms_banners(req, res) {
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
      let result;
      // let Data = [];
      if (is_deleted === "true") {
        // console.log("123");
        result = await cms_banners_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await cms_banners_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     agency_id: element.agency_id,
        //     name: element.name,
        //     heading: element.heading,
        //     url: element.url,
        //     description: element.description,
        //     status: element.status,
        //     image: element.image,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        // console.log("456");
        result = await cms_banners_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await cms_banners_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     agency_id: element.agency_id,
        //     name: element.name,
        //     heading: element.heading,
        //     url: element.url,
        //     description: element.description,
        //     status: element.status,
        //     image: element.image,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      }

      for (let i = 0; i < result.length; i++) {
        // result[i].image = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].image;
        result[i].image = await image_url(fn, result[i].image);
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

      const cms_banners = {
        cms_banner: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all cms_banners",
        {
          length: 1
        },
        cms_banners
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_cms_banners(req, res) {
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

      // const Data = {
      //   name: req.body.name,
      //   heading: req.body.heading,
      //   url: req.body.url,
      //   description: req.body.description,
      //   status: req.body.status,
      //   image: generateFilePathForDB(req.file)
      // };

      const Data = {
        name: req.body.name,
        heading: req.body.heading,
        url: req.body.url,
        description: req.body.description,
        status: req.body.status,
        // image: generateFilePathForDB(req.file)
        image: req.files?.image?.[0]?.filename
      };

      const update_cms_banners = await cms_banners_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update cms_banners",
        {
          length: 1
        },
        update_cms_banners
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cms_banners(req, res) {
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

      const delete_cms_banners = await cms_banners_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete cms_banners",
        {
          length: 1
        },
        delete_cms_banners
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
