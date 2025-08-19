const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cms_visa_booking_Schema = require("../models/cms_visa_booking.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
module.exports = class cms_visa_booking_Controller extends BaseController {
  async add_cms_visa_booking(req, res) {
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
        visa_status: req.body.visa_status,
        booking_details: {
          email: req.body.booking_details.email,
          first_name: req.body.booking_details.first_name,
          last_name: req.body.booking_details.last_name,
          gender: req.body.booking_details.gender,
          citizenship: req.body.booking_details.citizenship,
          residency: req.body.booking_details.residency,
          dob: req.body.booking_details.dob,
          birth_place: req.body.booking_details.birth_place,
          country: req.body.booking_details.country,
          state: req.body.booking_details.state,
          city: req.body.booking_details.city,
          home_address: req.body.booking_details.home_address,
          postal_code: req.body.booking_details.postal_code,
          mobile: req.body.booking_details.mobile,
          employment_status: req.body.booking_details.employment_status,
          passport_num: req.body.booking_details.passport_num,
          passport_issue_date: req.body.booking_details.passport_issue_date,
          passport_issue_authority: req.body.booking_details.passport_issue_authority,
          passport_front_file_path: req.body.booking_details.passport_front_file_path,
          passport_back_file_path: req.body.booking_details.passport_back_file_path,
          // file_photo_path: generateFilePathForDB(req.file),
          file_photo_path: generateFilePathForDB(req.file),
          departure: req.body.booking_details.departure,
          invoice: req.body.booking_details.invoice,
          additional_document: req.body.booking_details.additional_document
        }
      };
      const add_cms_visa_booking = new cms_visa_booking_Schema(data);
      const Add_cms_visa_booking = await add_cms_visa_booking.save();
      return this.sendJSONResponse(
        res,
        "add cms_visa_booking",
        {
          length: 1
        },
        Add_cms_visa_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cms_visa_booking(req, res) {
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

      const display_cms_visa_booking = await cms_visa_booking_Schema.find({ agency_id: tokenData.id, _id: _id });

      // display_cms_visa_booking[0].booking_details.file_photo_path =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_visa_booking[0].booking_details.file_photo_path;

      display_cms_visa_booking[0].booking_details.file_photo_path = image_url(
        "cms_visa_booking",
        display_cms_visa_booking[0].booking_details.file_photo_path
      );

      return this.sendJSONResponse(
        res,
        "display  cms_visa_booking",
        {
          length: 1
        },
        display_cms_visa_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_cms_visa_booking(req, res) {
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
        console.log("123");
        result = await cms_visa_booking_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await cms_visa_booking_Schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     booking_details: {
        //       email: element.booking_details.email,
        //       first_name: element.booking_details.first_name,
        //       last_name: element.booking_details.last_name,
        //       gender: element.booking_details.gender,
        //       citizenship: element.booking_details.citizenship,
        //       residency: element.booking_details.residency,
        //       dob: element.booking_details.dob,
        //       birth_place: element.booking_details.birth_place,
        //       country: element.booking_details.country,
        //       state: element.booking_details.state,
        //       city: element.booking_details.city,
        //       home_address: element.booking_details.home_address,
        //       postal_code: element.booking_details.postal_code,
        //       mobile: element.booking_details.mobile,
        //       employment_status: element.booking_details.employment_status,
        //       passport_num: element.booking_details.passport_num,
        //       passport_issue_date: element.booking_details.passport_issue_date,
        //       passport_issue_authority: element.booking_details.passport_issue_authority,
        //       passport_front_file_path: element.booking_details.passport_front_file_path,
        //       passport_back_file_path: element.booking_details.passport_back_file_path,
        //       file_photo_path: element.booking_details.file_photo_path,
        //       departure: element.booking_details.departure,
        //       invoice: element.booking_details.invoice,
        //       additional_document: element.booking_details.additional_document
        //     },
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        console.log("456");
        result = await cms_visa_booking_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await cms_visa_booking_Schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     booking_details: {
        //       email: element.booking_details.email,
        //       first_name: element.booking_details.first_name,
        //       last_name: element.booking_details.last_name,
        //       gender: element.booking_details.gender,
        //       citizenship: element.booking_details.citizenship,
        //       residency: element.booking_details.residency,
        //       dob: element.booking_details.dob,
        //       birth_place: element.booking_details.birth_place,
        //       country: element.booking_details.country,
        //       state: element.booking_details.state,
        //       city: element.booking_details.city,
        //       home_address: element.booking_details.home_address,
        //       postal_code: element.booking_details.postal_code,
        //       mobile: element.booking_details.mobile,
        //       employment_status: element.booking_details.employment_status,
        //       passport_num: element.booking_details.passport_num,
        //       passport_issue_date: element.booking_details.passport_issue_date,
        //       passport_issue_authority: element.booking_details.passport_issue_authority,
        //       passport_front_file_path: element.booking_details.passport_front_file_path,
        //       passport_back_file_path: element.booking_details.passport_back_file_path,
        //       file_photo_path: element.booking_details.file_photo_path,
        //       departure: element.booking_details.departure,
        //       invoice: element.booking_details.invoice,
        //       additional_document: element.booking_details.additional_document
        //     },
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      }

      for (let i = 0; i < result.length; i++) {
        // result[i].booking_details.file_photo_path =
        //   generateFileDownloadLinkPrefix(req.localHostURL) + result[i].booking_details.file_photo_path;
        result[i].booking_details.file_photo_path = await image_url(
          "cms_visa_booking",
          result[i].booking_details.file_photo_path
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

      const cms_visa_booking = {
        cms_visa_bookings: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all categories_Schema",
        {
          length: 1
        },
        cms_visa_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_cms_visa_booking(req, res) {
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
        visa_status: req.body.visa_status,
        booking_details: {
          email: req.body.booking_details.email,
          first_name: req.body.booking_details.first_name,
          last_name: req.body.booking_details.last_name,
          gender: req.body.booking_details.gender,
          citizenship: req.body.booking_details.citizenship,
          residency: req.body.booking_details.residency,
          dob: req.body.booking_details.dob,
          birth_place: req.body.booking_details.birth_place,
          country: req.body.booking_details.country,
          state: req.body.booking_details.state,
          city: req.body.booking_details.city,
          home_address: req.body.booking_details.home_address,
          postal_code: req.body.booking_details.postal_code,
          mobile: req.body.booking_details.mobile,
          employment_status: req.body.booking_details.employment_status,
          passport_num: req.body.booking_details.passport_num,
          passport_issue_date: req.body.booking_details.passport_issue_date,
          passport_issue_authority: req.body.booking_details.passport_issue_authority,
          passport_front_file_path: req.body.booking_details.passport_front_file_path,
          passport_back_file_path: req.body.booking_details.passport_back_file_path,
          file_photo_path: generateFilePathForDB(req.file),
          departure: req.body.booking_details.departure,
          invoice: req.body.booking_details.invoice,
          additional_document: req.body.booking_details.additional_document
        },
        is_deleted: req.body.is_deleted
      };

      const update_cms_visa_booking = await cms_visa_booking_Schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update cms_visa_booking",
        {
          length: 1
        },
        update_cms_visa_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cms_visa_booking(req, res) {
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

      const delete_cms_visa_booking = await cms_visa_booking_Schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete cms_visa_booking",
        {
          length: 1
        },
        delete_cms_visa_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
