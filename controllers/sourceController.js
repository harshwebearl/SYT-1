const BaseController = require("./BaseController");
const source_schema = require("../models/sourceSchema");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const mongoose = require("mongoose");

module.exports = class source_controller extends BaseController {
  async add_source(req, res) {
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
        email: req.body.email,
        contact_no: req.body.contact_no,
        address_1: req.body.address_1,
        address_2: req.body.address_2,
        state: req.body.state,
        country: req.body.country,
        city: req.body.city,
        pin_code: req.body.pin_code
      };
      const add_source = new source_schema(data);
      const add_Source = await add_source.save();
      // console.log(add_Source);
      return this.sendJSONResponse(
        res,
        "source added",
        {
          length: 1
        },
        add_Source
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_source(req, res) {
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

      const display_source = await source_schema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display source",
        {
          length: 1
        },
        display_source
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_source(req, res) {
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
        result = await source_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await source_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     name: element.name,
        //     email: element.email,
        //     contact_no: element.contact_no,
        //     address_1: element.address_1,
        //     address_2: element.address_2,
        //     country: element.country,
        //     state: element.state,
        //     city: element.city,
        //     pin_code: element.pin_code,
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        console.log("456");
        result = await source_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await source_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     name: element.name,
        //     email: element.email,
        //     contact_no: element.contact_no,
        //     address_1: element.address_1,
        //     address_2: element.address_2,
        //     country: element.country,
        //     state: element.state,
        //     city: element.city,
        //     pin_code: element.pin_code,
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
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

      const source = {
        sources: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display source",
        {
          length: 1
        },
        source
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_source(req, res) {
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
        contact_no: req.body.contact_no,
        address_1: req.body.address_1,
        address_2: req.body.address_2,
        state: req.body.state,
        country: req.body.country,
        city: req.body.city,
        pin_code: req.body.pin_code,
        is_deleted: req.body.is_deleted
      };

      const update_source = await source_schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, Data);
      return this.sendJSONResponse(
        res,
        "update source",
        {
          length: 1
        },
        update_source
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_source(req, res) {
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

      const delete_source = await source_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete_source",
        {
          length: 1
        },
        delete_source
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
