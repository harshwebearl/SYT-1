const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cfar_schema = require("../models/cfar.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");

module.exports = class cfar_Controller extends BaseController {
  async add_cfar(req, res) {
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
        page: req.body.page,
        from_date: req.body.from_date,
        to_date: req.body.to_date,
        sections: {
          heading: req.body.sections.heading,
          url: req.body.sections.url,
          sub_title: req.body.sections.sub_title,
          alt_tag: req.body.sections.alt_tag,
          img: generateFilePathForDB(req.file)
        }
      };

      const add_cfar = new cfar_schema(data);
      const Add_cfar = await add_cfar.save();

      return this.sendJSONResponse(
        res,
        "add cfar ",
        {
          length: 1
        },
        Add_cfar
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cfar(req, res) {
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

      const display_cfar = await cfar_schema.find({ agency_id: tokenData.id, _id: _id });

      // display_cfar[0].sections.img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cfar[0].sections.img;

      for (let i = 0; i < display_cfar.length; i++) {
        display_cfar[0].sections.img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cfar[0].sections.img;
      }

      return this.sendJSONResponse(
        res,
        "display  cfar",
        {
          length: 1
        },
        display_cfar
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_cfar(req, res) {
    try {
      // const is_deleted = req.query.is_deleted;
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

      let { limit, pages, is_deleted } = req.query;
      if ([null, undefined, ""].includes(pages)) {
        pages = 1;
      }
      if ([null, undefined, "", 1].includes(limit)) {
        limit = 50;
      }
      const option = {
        limit: limit,
        pages: pages
      };

      let productPaginate1;
      let Data = [];
      let result;
      if (is_deleted === "true") {
        // console.log("123");
        result = await cfar_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        productPaginate1 = await cfar_schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            agency_id: element.id,
            _id: element._id,
            page: element.page,
            from_date: element.from_date,
            is_deleted: element.is_deleted,
            to_date: element.to_date,
            sections: {
              heading: element.sections.heading,
              url: element.sections.url,
              sub_title: element.sections.sub_title,
              alt_tag: element.sections.alt_tag,
              img: element.img
            }
          });
        });
      } else {
        // console.log("456");
        result = await cfar_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        productPaginate1 = await cfar_schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            agency_id: element.id,
            _id: element._id,
            page: element.page,
            from_date: element.from_date,
            to_date: element.to_date,
            is_deleted: element.is_deleted,
            sections: {
              heading: element.sections.heading,
              url: element.sections.url,
              sub_title: element.sections.sub_title,
              alt_tag: element.sections.alt_tag,
              img: element.img
            }
          });
        });
      }

      for (let i = 0; i < result.length; i++) {
        result[i].sections.img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].sections.img;
      }

      const pageInfo = {};
      pageInfo.totalDocs = productPaginate1.totalDocs;
      pageInfo.limit = productPaginate1.limit;
      pageInfo.page = productPaginate1.page;
      pageInfo.totalPages = productPaginate1.totalDocs;
      pageInfo.pagingCounter = productPaginate1.pagingCounter;
      pageInfo.hasPrevPage = productPaginate1.hasPrevPage;
      pageInfo.hasNextPage = productPaginate1.hasNextPage;
      pageInfo.prevPage = productPaginate1.prevPage;
      pageInfo.nextPage = productPaginate1.nextPage;

      const cfar = {
        cfar: Data,
        pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all cfar",
        {
          length: 1
        },
        cfar
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_cfar(req, res) {
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
        page: req.body.page,
        from_date: req.body.from_date,
        to_date: req.body.to_date,
        sections: {
          heading: req.body.sections.heading,
          url: req.body.sections.url,
          sub_title: req.body.sections.sub_title,
          alt_tag: req.body.sections.alt_tag,
          img: generateFilePathForDB(req.file)
        },
        is_deleted: req.body.is_deleted
      };

      const update_cfar = await cfar_schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, Data);
      return this.sendJSONResponse(
        res,
        "update cfar",
        {
          length: 1
        },
        update_cfar
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cfar(req, res) {
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

      const delete_cfar = await cfar_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete cfar",
        {
          length: 1
        },
        delete_cfar
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
