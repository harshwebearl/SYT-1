const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cms_aboutus_schema = require("../models/cms_aboutus.Schema");
const mongoose = require("mongoose");
const image_url = require("../update_url_path.js");

const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");

module.exports = class cms_aboutus_Controller extends BaseController {
  async add_cms_aboutus(req, res) {
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
      //  res.send(req.files);
      const p = "/";
      const data = {
        agency_id: tokenData.id,
        header: req.body.header,
        banner_text: req.body.banner_text,
        partner_header: req.body.partner_header,
        // banner_img: req.files.banner_img[0].path.split("\\").join(p).split('public')[1],
        banner_img: req.files.banner_img[0].filename,
        description: req.body.description,
        // partner_images: req.files.partner_images.map(image => image.path),
        partner_images: req.files.partner_images.map((image) => image.filename)
      };

      const add_cms_aboutus = new cms_aboutus_schema(data);
      const Add_cms_aboutus = await add_cms_aboutus.save();

      //   Add_cms_aboutus.image = generateDownloadLink(Add_cms_aboutus.image);

      return this.sendJSONResponse(
        res,
        "add cms_aboutus ",
        {
          length: 1
        },
        Add_cms_aboutus
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cms_aboutus(req, res) {
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

      const display_cms_aboutus = await cms_aboutus_schema.find({ agency_id: tokenData.id, _id: _id });

      // display_cms_aboutus[0].banner_img =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_aboutus[0].banner_img;

      // display_cms_aboutus[0].partner_images =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_aboutus[0].partner_images;

      display_cms_aboutus[0].banner_img = image_url("cms_aboutus", display_cms_aboutus[0].banner_img);

      display_cms_aboutus[0].partner_images = image_url("cms_aboutus", display_cms_aboutus[0].partner_images);

      return this.sendJSONResponse(
        res,
        "display  cms_aboutus",
        {
          length: 1
        },
        display_cms_aboutus
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_cms_aboutus(req, res) {
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
        result = await cms_aboutus_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await cms_aboutus_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     agency_id: element.agency_id,
        //     header: element.header,
        //     banner_text: element.banner_text,
        //     partner_header: element.partner_header,
        //     banner_img: element.banner_img,
        //     description: element.description,
        //     partner_images: element.partner_images,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        // console.log("456");
        result = await cms_aboutus_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await cms_aboutus_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     agency_id: element.agency_id,
        //     header: element.header,
        //     banner_text: element.banner_text,
        //     partner_header: element.partner_header,
        //     banner_img: element.banner_img,
        //     description: element.description,
        //     partner_images: element.partner_images,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      }

      // for (let i = 0; i < result.length; i++) {
      //   result[i].banner_img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].banner_img;
      // }
      // for (let i = 0; i < result.length; i++) {
      //   for (let j = 0; j < result[i].partner_images.length; j++) {
      //     result[i].partner_images[j] = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].partner_images[j];
      //   }
      // }
      for (let i = 0; i < result.length; i++) {
        result[i].banner_img = await image_url("cms_aboutus", result[i].banner_img);
      }
      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].partner_images.length; j++) {
          result[i].partner_images[j] = await image_url("cms_aboutus", result[i].partner_images[j]);
        }
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

      const cms_aboutus = {
        cms_about_us: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all cms_aboutus",
        {
          length: 1
        },
        cms_aboutus
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_cms_aboutus(req, res) {
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
      console.log(req.files);
      const Data = {
        header: req.body.header,
        banner_text: req.body.banner_text,
        partner_header: req.body.partner_header,
        // banner_img: req.files?.banner_img?.map((file) => generateFilePathForDB(file))?.[0],
        banner_img: req.files?.banner_img?.filename?.[0],
        description: req.body.description,
        // partner_images: req.files?.partner_images?.map((file) => generateFilePathForDB(file))?.[0]
        partner_images: req.files?.partner_images?.map((file) => file.filename)
      };

      const update_cms_aboutus = await cms_aboutus_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update cms_aboutus",
        {
          length: 1
        },
        update_cms_aboutus
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cms_aboutus(req, res) {
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

      const delete_cms_aboutus = await cms_aboutus_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete cms_aboutus",
        {
          length: 1
        },
        delete_cms_aboutus
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
