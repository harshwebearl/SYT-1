const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const suppliers_schema = require("../models/suppliers.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");

module.exports = class suppliers_Controller extends BaseController {
  async add_suppliers(req, res) {
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

      //    const additional_fields = {
      //        name:req.body.name,
      //        control_type:req.body.control_type
      // }
      //  const additional_fields = [];

      const data = {
        agency_id: tokenData.id,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        // password: req.body.password,
        country: req.body.country,
        access_services: req.body.access_services,
        company_info: {
          name: req.body.company_info.name,
          email: req.body.company_info.email,
          phone: req.body.company_info.phone,
          fax: req.body.company_info.fax,
          website: req.body.company_info.website,
          gst_num: req.body.company_info.gst_num,
          pan_num: req.body.company_info.pan_num
        },
        account_info: req.body.account_info
      };

      //  const additional_fields = {
      //     name:req.body.name,
      //     control_type:req.body.control_type
      //  }
      //  const result ={
      //   data,
      //   // additional_fields
      //  }

      const add_suppliers = new suppliers_schema(data);
      const Add_suppliers = await add_suppliers.save();
      console.log(Add_suppliers);

      //   Add_currencies.photo = generateDownloadLink(Add_currencies.photo);

      return this.sendJSONResponse(
        res,
        "add suppliers",
        {
          length: 1
        },
        Add_suppliers
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_suppliers(req, res) {
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

      const display_suppliers = await suppliers_schema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display  suppliers",
        {
          length: 1
        },
        display_suppliers
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_suppliers(req, res) {
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
        result = await suppliers_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await suppliers_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     name: element.name,
        //     is_deleted: element.is_deleted,
        //     agency_id: element.agency_id,
        //     email: element.email,
        //     phone: element.phone,
        //     address: element.address,
        //     city: element.city,
        //     state: element.state,
        //     country: element.country,
        //     access_services: element.access_services,
        //     company_info: {
        //       name: element.company_info.name,
        //       email: element.company_info.email,
        //       phone: element.company_info.phone,
        //       fax: element.company_info.fax,
        //       website: element.company_info.website,
        //       gst_num: element.company_info.gst_num,
        //       pan_num: element.company_info.pan_num
        //     },
        //     account_info: {
        //       bank_name: element.account_info.bank_name,
        //       account_num: element.account_info.account_num,
        //       bank_address: element.account_info.bank_address,
        //       ifsc_code: element.account_info.ifsc_code
        //     }
        //   });
        // });
      } else {
        // console.log("456");
        result = await suppliers_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await suppliers_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     name: element.name,
        //     is_deleted: element.is_deleted,
        //     agency_id: element.agency_id,
        //     email: element.email,
        //     phone: element.phone,
        //     address: element.address,
        //     city: element.city,
        //     state: element.state,
        //     country: element.country,
        //     access_services: element.access_services,
        //     company_info: {
        //       name: element.company_info.name,
        //       email: element.company_info.email,
        //       phone: element.company_info.phone,
        //       fax: element.company_info.fax,
        //       website: element.company_info.website,
        //       gst_num: element.company_info.gst_num,
        //       pan_num: element.company_info.pan_num
        //     },
        //      account_info: req.body.account_info
        //   });
        // });
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

      const supplier = {
        suppliers: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all suppliers",
        {
          length: 1
        },
        supplier
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_suppliers(req, res) {
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
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        access_services: req.body.access_services,
        company_info: req.body.company_info,
        // company_info: {
        //   name: req.body.company_info.name,
        //   email: req.body.company_info.email,
        //   phone: req.body.company_info.phone,
        //   fax: req.body.company_info.fax,
        //   website: req.body.company_info.website,
        //   gst_num: req.body.company_info.gst_num,
        //   pan_num: req.body.company_info.pan_num
        // },
        account_info: req.body.account_info,
        // account_info: [
        //   {
        //     bank_name: req.body.account_info.bank_name,
        //     account_num: req.body.account_info.account_num,
        //     bank_address: req.body.account_info.bank_address,
        //     ifsc_code: req.body.account_info.ifsc_code
        //   }
        // ],
        is_deleted: req.body.is_deleted
      };

      const update_suppliers = await suppliers_schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, Data);
      return this.sendJSONResponse(
        res,
        "update suppliers",
        {
          length: 1
        },
        update_suppliers
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_suppliers(req, res) {
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

      const delete_suppliers = await suppliers_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete suppliers",
        {
          length: 1
        },
        delete_suppliers
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
