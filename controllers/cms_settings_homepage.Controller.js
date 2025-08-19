const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cms_settings_homepage_schema = require("../models/cms_settings_homepage.Schema");
const mongoose = require("mongoose");
const image_url = require("../update_url_path.js");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");

module.exports = class cms_settings_homepage_Controller extends BaseController {
  async add_cms_settings_homepage(req, res) {
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
        welcome_header: req.body.welcome_header,
        // favicon_img: req.files?.favicon_img?.map((file) => generateFilePathForDB(file))?.[0],
        // logo_img: req.files?.logo_img?.map((file) => generateFilePathForDB(file))?.[0],
        favicon_img: req.files?.favicon_img?.[0].filename,
        logo_img: req.files?.logo_img?.[0]?.filename,
        testimonial_banner_text: req.body.testimonial_banner_text,
        // testimonial_banner_img: req.files?.testimonial_banner_img?.map((file) => generateFilePathForDB(file))?.[0],
        // testimonial_background_img: req.files?.testimonial_background_img?.map((file) =>
        //   generateFilePathForDB(file)
        // )?.[0],
        // testimonial_banner_img: req.files?.testimonial_banner_img?.map((file) =>(file.filename))?.[0],
        // testimonial_background_img: req.files?.testimonial_background_img?.map((file) => (file.filename)
        // )?.[0],
        testimonial_banner_img: req.files?.testimonial_banner_img?.[0]?.filename,
        testimonial_background_img: req.files?.testimonial_background_img?.[0]?.filename,
        description: req.body.description,
        structured_data_markup: req.body.structured_data_markup,
        social_markup: req.body.social_markup,
        analytics: req.body.analytics,
        remarketing: req.body.remarketing,
        og_tag: req.body.og_tag,
        headers: JSON.parse(req.body.headers)
      };

      const add_cms_settings_homepage = new cms_settings_homepage_schema(data);
      const Add_cms_settings_homepage = await add_cms_settings_homepage.save();

      //   Add_cms_settings_homepage.image = generateDownloadLink(Add_cms_settings_homepage.image);

      return this.sendJSONResponse(
        res,
        "add cms_settings_homepage ",
        {
          length: 1
        },
        Add_cms_settings_homepage
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cms_settings_homepage(req, res) {
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

      const display_cms_settings_homepage = await cms_settings_homepage_schema.find({
        agency_id: tokenData.id,
        _id: _id
      });

      // display_cms_settings_homepage[0].favicon_img =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_settings_homepage[0].favicon_img;

      // display_cms_settings_homepage[0].logo_img =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_settings_homepage[0].logo_img;

      // display_cms_settings_homepage[0].testimonial_banner_img =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_settings_homepage[0].testimonial_banner_img;

      // display_cms_settings_homepage[0].testimonial_background_img =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_settings_homepage[0].testimonial_background_img;

      display_cms_settings_homepage[0].favicon_img = await image_url(
        "cms_settings_homepage",
        display_cms_settings_homepage[0].favicon_img
      );

      display_cms_settings_homepage[0].logo_img = await image_url(
        "cms_settings_homepage",
        display_cms_settings_homepage[0].logo_img
      );

      display_cms_settings_homepage[0].testimonial_banner_img = await image_url(
        "cms_settings_homepage",
        display_cms_settings_homepage[0].testimonial_banner_img
      );

      display_cms_settings_homepage[0].testimonial_background_img = await image_url(
        "cms_settings_homepage",
        display_cms_settings_homepage[0].testimonial_background_img
      );

      return this.sendJSONResponse(
        res,
        "display  cms_settings_homepage",
        {
          length: 1
        },
        display_cms_settings_homepage
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_cms_settings_homepage(req, res) {
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
        result = await cms_settings_homepage_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await cms_settings_homepage_schema.aggregatePaginate(result, option);
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
        result = await cms_settings_homepage_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await cms_settings_homepage_schema.aggregatePaginate(result, option);
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

      for (let i = 0; i < result.length; i++) {
        // result[i].favicon_img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].favicon_img;
        result[i].favicon_img = await image_url("cms_settings_homepage", result[i].favicon_img);
      }
      for (let i = 0; i < result.length; i++) {
        // result[i].logo_img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].logo_img;
        result[i].logo_img = await image_url("cms_settings_homepage", result[i].logo_img);
      }
      for (let i = 0; i < result.length; i++) {
        result[i].testimonial_banner_img =
          // generateFileDownloadLinkPrefix(req.localHostURL) + result[i].testimonial_banner_img;
          await image_url("cms_settings_homepage", result[i].testimonial_banner_img);
      }
      for (let i = 0; i < result.length; i++) {
        // result[i].testimonial_background_img =
        //   generateFileDownloadLinkPrefix(req.localHostURL) + result[i].testimonial_background_img;
        result[i].testimonial_background_img = await image_url(
          "cms_settings_homepage",
          result[i].testimonial_background_img
        );
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

      const cms_settings_homepage = {
        cms_about_us: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all cms_settings_homepage",
        {
          length: 1
        },
        cms_settings_homepage
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_cms_settings_homepage(req, res) {
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
        welcome_header: req.body.welcome_header,
        // favicon_img: req.files?.favicon_img?.map((file) => generateFilePathForDB(file))?.[0],
        // logo_img: req.files?.logo_img?.map((file) => generateFilePathForDB(file))?.[0],
        favicon_img: req.files?.favicon_img?.[0].filename,
        logo_img: req.files?.logo_img?.[0]?.filename,
        testimonial_banner_text: req.body.testimonial_banner_text,
        // testimonial_banner_img: req.files?.testimonial_banner_img?.map((file) => generateFilePathForDB(file))?.[0],
        // testimonial_background_img: req.files?.testimonial_background_img?.map((file) =>
        //   generateFilePathForDB(file)
        // )?.[0],
        testimonial_banner_img: req.files?.testimonial_banner_img?.[0]?.filename,
        testimonial_background_img: req.files?.testimonial_background_img?.[0]?.filename,
        description: req.body.description,
        structured_data_markup: req.body.structured_data_markup,
        social_markup: req.body.social_markup,
        analytics: req.body.analytics,
        remarketing: req.body.remarketing,
        og_tag: req.body.og_tag,
        headers: JSON.parse(req.body.headers),
        is_deleted: req.body.is_deleted
      };

      const update_cms_settings_homepage = await cms_settings_homepage_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update cms_settings_homepage",
        {
          length: 1
        },
        update_cms_settings_homepage
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cms_settings_homepage(req, res) {
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

      const delete_cms_settings_homepage = await cms_settings_homepage_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete cms_settings_homepage",
        {
          length: 1
        },
        delete_cms_settings_homepage
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
