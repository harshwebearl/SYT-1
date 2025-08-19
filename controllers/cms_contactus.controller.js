const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cms_contactus_schema = require("../models/cms_contactus.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
module.exports = class cms_contactus_Controller extends BaseController {
  async add_cms_contactus(req, res) {
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
        header: req.body.header,
        banner_text: req.body.banner_text,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        isNoFollow: req.body.isNoFollow,
        isNoIndex: req.body.isNoIndex,
        // banner_img: generateFilePathForDB(req.file),
        banner_img: req.files.banner_img[0].filename,
        contect_us_list: JSON.parse(req.body.contect_us_list),
        phone_list: JSON.parse(req.body.phone_list),
        email_list: JSON.parse(req.body.email_list),
        mail_list: JSON.parse(req.body.mail_list)
      };

      const add_cms_contactus = new cms_contactus_schema(data);
      const Add_cms_contactus = await add_cms_contactus.save();
      console.log(Add_cms_contactus);
      // Add_cms_contactus.banner_img = generateDownloadLink(Add_cms_contactus.banner_img);

      // Add_cms_contactus.icon_img = generateDownloadLink(Add_cms_contactus.icon_img);

      return this.sendJSONResponse(
        res,
        "Add cms_contactus",
        {
          length: 1
        },
        Add_cms_contactus
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cms_contactus(req, res) {
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

      const display_cms_contactus = await cms_contactus_schema.find({ agency_id: tokenData.id, _id: _id });

      // display_cms_contactus[0].banner_img =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_contactus[0].banner_img;

      // display_cms_contactus[0].banner_img =
      // generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_contactus[0].banner_img;

      display_cms_contactus[0].banner_img = await image_url("cms_contactus", display_cms_contactus[0].banner_img);

      return this.sendJSONResponse(
        res,
        "display cms_contactus",
        {
          length: 1
        },
        display_cms_contactus
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_cms_contactus(req, res) {
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
      // let Data = [];
      if (is_deleted === "true") {
        // console.log("123");
        result = await cms_contactus_schema.aggregate([
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
              from: "cms_contactus_types",
              localField: "cms_contactus_type",
              foreignField: "_id",
              as: "cms_contactus_types"
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
        result = await cms_contactus_schema.aggregate([
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
              from: "cms_contactus_types",
              localField: "cms_contactus_type",
              foreignField: "_id",
              as: "cms_contactus_types"
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
        // result[i].banner_img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].banner_img;
        result[i].banner_img = await image_url("cms_contactus", result[i].banner_img);
      }

      const cms_contactuss = {
        cms_contactus: result
      };
      return this.sendJSONResponse(
        res,
        "display  cms_contactus",
        {
          length: 1
        },
        cms_contactuss
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_cms_contactus(req, res) {
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
        header: req.body.header,
        banner_text: req.body.banner_text,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        isNoFollow: req.body.isNoFollow,
        isNoIndex: req.body.isNoIndex,
        // banner_img: generateFilePathForDB(req.file),
        banner_img: req.files?.banner_img?.filename?.[0],
        contect_us_list: JSON.parse(req.body.contect_us_list),
        phone_list: JSON.parse(req.body.phone_list),
        email_list: JSON.parse(req.body.email_list),
        mail_list: req.body.mail_list && JSON.parse(req.body.mail_list), //JSON.parse() should handle corner cases
        is_deleted: req.body.is_deleted
      };

      const update_cms_contactus = await cms_contactus_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update cms_contactus",
        {
          length: 1
        },
        update_cms_contactus
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cms_contactus(req, res) {
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

      const delete_cms_contactus = await cms_contactus_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete cms_contactus",
        {
          length: 1
        },
        delete_cms_contactus
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
