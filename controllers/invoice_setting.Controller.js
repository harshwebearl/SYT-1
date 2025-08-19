const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const invoice_setting_schema = require("../models/invoice_setting.Schema");
const mongoose = require("mongoose");
const userSchema = require("../models/usersSchema");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const fn = "invoice_setting";
module.exports = class invoice_setting_Controller extends BaseController {
  async add_invoice_setting(req, res) {
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
      // res.send(req.files);
      const data = {
        agency_id: tokenData.id,
        business_type: req.body.business_type,
        organization_name: req.body.organization_name,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        website_url: req.body.website_url,
        addressline1: req.body.addressline1,
        addressline2: req.body.addressline2,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        pincode: req.body.pincode,
        gstin: req.body.gstin,
        // invoice_logo: req.files?.invoice_logo?.map((file) => generateFilePathForDB(file))?.[0],
        // digital_signature: req.files?.digital_signature?.map((file) => generateFilePathForDB(file))?.[0],
        invoice_logo: req.files.invoice_logo[0].filename,
        digital_signature: req.files.digital_signature[0].filename,
        // invoice_logo:req.body.invoice_logo,
        // digital_signature:req.body.digital_signature,
        note: req.body.note,
        is_invoice_wo_payment_links: req.body.is_invoice_wo_payment_links
      };
      const Add_invoice_setting = new invoice_setting_schema(data);
      const add_invoice_setting = await Add_invoice_setting.save();
      return this.sendJSONResponse(
        res,
        "invoice_setting add",
        {
          length: 1
        },
        add_invoice_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error);
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_invoice_setting(req, res) {
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

      const display_invoice_setting = await invoice_setting_schema.find({ agency_id: tokenData.id });

      // display_invoice_setting[0].invoice_logo =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_invoice_setting[0].invoice_logo;

      // display_invoice_setting[0].digital_signature =
      //   generateFileDownloadLinkPrefix(req.localHostURL) + display_invoice_setting[0].digital_signature;

      display_invoice_setting[0].invoice_logo = await image_url(fn, display_invoice_setting[0].invoice_logo);

      display_invoice_setting[0].digital_signature = await image_url(fn, display_invoice_setting[0].invoice_logo);

      return this.sendJSONResponse(
        res,
        "display  invoice_setting",
        {
          length: 1
        },
        display_invoice_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_invoice_setting(req, res) {
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
        result = await invoice_setting_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await invoice_setting_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     business_type: {
        //       organization_name: element.business_type.organization_name,
        //       first_name: element.business_type.first_name,
        //       last_name: element.business_type.last_name,
        //       email: element.business_type.email,
        //       website_URL: element.business_type.website_URL,
        //       address1: element.business_type.address1,
        //       address2: element.business_type.address2,
        //       country: element.business_type.country,
        //       State: element.business_type.State,
        //       City: element.business_type.City,
        //       pincode: element.business_type.pincode,
        //       GST_no: element.business_type.GST_no
        //     },
        //     logo_and_note: {
        //       logo: element.logo,
        //       signature: element.signature
        //     },
        //     default_note: {
        //       email: element.default_note.email,
        //       phone: element.default_note.phone,
        //       pan_no: element.default_note.pan_no,
        //       bank_name: element.default_note.bank_name,
        //       AC_Holder: element.default_note.AC_Holder,
        //       AC_Type: element.default_note.AC_Type,
        //       AC_No: element.default_note.AC_No,
        //       IFSC: element.default_note.IFSC
        //     },
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        // console.log("456");
        result = await invoice_setting_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await invoice_setting_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     business_type: {
        //       organization_name: element.business_type.organization_name,
        //       first_name: element.business_type.first_name,
        //       last_name: element.business_type.last_name,
        //       email: element.business_type.email,
        //       website_URL: element.business_type.website_URL,
        //       address1: element.business_type.address1,
        //       address2: element.business_type.address2,
        //       country: element.business_type.country,
        //       State: element.business_type.State,
        //       City: element.business_type.City,
        //       pincode: element.business_type.pincode,
        //       GST_no: element.business_type.GST_no
        //     },
        //     logo_and_note: {
        //       logo: element.logo_and_note.logo,
        //       signature: element.logo_and_note.signature
        //     },
        //     default_note: {
        //       // email: element.default_note.email,
        //       phone: element.default_note.phone,
        //       pan_no: element.default_note.pan_no,
        //       bank_name: element.default_note.bank_name,
        //       AC_Holder: element.default_note.AC_Holder,
        //       AC_Type: element.default_note.AC_Type,
        //       AC_No: element.default_note.AC_No,
        //       IFSC: element.default_note.IFSC
        //     },
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      }

      // for (let i = 0; i < result.length; i++) {
      //   result[i].invoice_logo = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].invoice_logo;
      // }
      // for (let i = 0; i < result.length; i++) {
      //   result[i].digital_signature = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].digital_signature;
      // }

      for (let i = 0; i < result.length; i++) {
        result[i].invoice_logo = await image_url(fn, result[i].invoice_logo);
      }
      for (let i = 0; i < result.length; i++) {
        result[i].digital_signature = await image_url(fn, result[i].digital_signature);
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

      const invoice_setting = {
        invoice_setting: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "invoice_setting display",
        {
          length: 1
        },
        invoice_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_invoice_setting(req, res) {
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
        business_type: req.body.business_type,
        organization_name: req.body.organization_name,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        website_url: req.body.website_url,
        addressline1: req.body.addressline1,
        addressline2: req.body.addressline2,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        pincode: req.body.pincode,
        gstin: req.body.gstin,
        // invoice_logo: req.files?.invoice_logo?.map((file) => generateFilePathForDB(file))?.[0],
        // digital_signature: req.files?.digital_signature?.map((file) => generateFilePathForDB(file))?.[0],
        invoice_logo: req.files?.invoice_logo?.[0]?.filename,
        digital_signature: req.files?.digital_signature?.[0]?.filename,
        // invoice_logo:req.body.invoice_logo,
        // digital_signature:req.body.digital_signature,
        note: req.body.note,
        is_invoice_wo_payment_links: req.body.is_invoice_wo_payment_links,
        is_deleted: req.body.is_deleted
      };

      const update_invoice_setting_check = await invoice_setting_schema.findOne({ agency_id: tokenData.id });

      let update_invoice_setting;

      if (!update_invoice_setting_check) {
        const Add_invoice_setting = new invoice_setting_schema(Data);
        update_invoice_setting = await Add_invoice_setting.save();
      } else {
        update_invoice_setting = await invoice_setting_schema.updateOne({ agency_id: tokenData.id }, Data);
      }

      return this.sendJSONResponse(
        res,
        "update invoice_setting",
        {
          length: 1
        },
        update_invoice_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_invoice_setting_status(req, res) {
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
        status: req.body.status
        // is_deleted: true
      };

      const update_invoice_setting_status = await invoice_setting_schema.findByIdAndUpdate({ _id: _id }, Data);
      return this.sendJSONResponse(
        res,
        "update invoice_setting",
        {
          length: 1
        },
        update_invoice_setting_status
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_invoice_setting(req, res) {
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

      const data = {
        is_deleted: true
      };

      const delete_invoice_setting = await invoice_setting_schema.findByIdAndUpdate({ _id: _id }, data);

      return this.sendJSONResponse(
        res,
        "delete invoice_setting",
        {
          length: 1
        },
        delete_invoice_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
