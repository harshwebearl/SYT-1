const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cms_website_setting_schema = require("../models/cms_website_setting.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");

module.exports = class cms_website_setting_Controller extends BaseController {
  async add_cms_website_setting(req, res) {
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
        flight: {
          gst_number: req.body.flight.gst_number,
          tcs_number: req.body.flight.tcs_number
        },
        hotel: {
          gst_number: req.body.hotel.gst_number,
          tcs_number: req.body.hotel.tcs_number
        },
        hotel_last_cancellation_config: {
          no_of_days_before: req.body.hotel_last_cancellation_config.no_of_days_before,
          is_hold_booking: req.body.hotel_last_cancellation_config.is_hold_booking
        },
        holiday: {
          gst_number: req.body.holiday.gst_number,
          tcs_number: req.body.holiday.tcs_number
        },
        activitie: {
          gst_number: req.body.activitie.gst_number,
          tcs_number: req.body.activitie.tcs_number
        }
      };

      const add_cms_website_setting = new cms_website_setting_schema(data);
      const Add_cms_website_setting = await add_cms_website_setting.save();
      console.log(Add_cms_website_setting);

      // Add_cms_website_setting.icon_img = generateDownloadLink(Add_cms_website_setting.icon_img);

      return this.sendJSONResponse(
        res,
        "Add cms_website_setting",
        {
          length: 1
        },
        Add_cms_website_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cms_website_setting(req, res) {
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

      const display_cms_website_setting = await cms_website_setting_schema.find({
        agency_id: tokenData.id
        // _id: _id
      });

      return this.sendJSONResponse(
        res,
        "display  cms_website_setting",
        {
          length: 1
        },
        display_cms_website_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_cms_website_setting(req, res) {
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
        result = await cms_website_setting_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
      } else {
        // console.log("456");
        result = await cms_website_setting_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
      }

      const cms_website_settings = {
        cms_website_setting: result
      };
      return this.sendJSONResponse(
        res,
        "display  cms_website_setting",
        {
          length: 1
        },
        cms_website_settings
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_cms_website_setting(req, res) {
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
        flight: {
          gst_number: req.body.flight.gst_number,
          tcs_number: req.body.flight.tcs_number
        },
        hotel: {
          gst_number: req.body.hotel.gst_number,
          tcs_number: req.body.hotel.tcs_number
        },
        hotel_last_cancellation_config: {
          no_of_days_before: req.body.hotel_last_cancellation_config.no_of_days_before,
          is_hold_booking: req.body.hotel_last_cancellation_config.is_hold_booking
        },
        holiday: {
          gst_number: req.body.holiday.gst_number,
          tcs_number: req.body.holiday.tcs_number
        },
        activities: {
          gst_number: req.body.activities.gst_number,
          tcs_number: req.body.activities.tcs_number
        },
        is_deleted: req.body.is_deleted
      };

      const update_cms_website_setting = await cms_website_setting_schema.findOneAndUpdate(
        {
          // _id: _id,
          agency_id: tokenData.id
        },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update cms_website_setting",
        {
          length: 1
        },
        update_cms_website_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cms_website_setting(req, res) {
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

      const delete_cms_website_setting = await cms_website_setting_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete cms_website_setting",
        {
          length: 1
        },
        delete_cms_website_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
