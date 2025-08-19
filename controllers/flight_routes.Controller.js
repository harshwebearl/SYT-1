const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const flight_routes_schema = require("../models/flight_routes.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const fn = "flight_routes";
module.exports = class flight_routes_Controller extends BaseController {
  async add_flight_routes(req, res) {
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
        flight_type: req.body.flight_type,
        // img: generateFilePathForDB(req.file),
        img: req.files.img[0].filename,
        from_flight: req.body.from_flight,
        to_flight: req.body.to_flight,
        from_flight_heading: req.body.from_flight_heading,
        to_flight_heading: req.body.to_flight_heading,
        is_featured: req.body.is_featured
      };

      const add_flight_routes = new flight_routes_schema(data);
      const Add_flight_routes = await add_flight_routes.save();

      // Add_flight_routes.img = generateDownloadLink(Add_flight_routes.img);

      return this.sendJSONResponse(
        res,
        "add flight_routes ",
        {
          length: 1
        },
        Add_flight_routes
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_flight_routes(req, res) {
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

      const display_flight_routes = await flight_routes_schema.find({ agency_id: tokenData.id, _id: _id });

      // display_flight_routes[0].img = generateFileDownloadLinkPrefix(req.localHostURL) + display_flight_routes[0].img;
      display_flight_routes[0].img = await image_url(fn, display_flight_routes[0].img);

      return this.sendJSONResponse(
        res,
        "display  flight_routes",
        {
          length: 1
        },
        display_flight_routes
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_flight_route(req, res) {
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

      let { limit, page, is_deleted } = req.query;
      if ([null, undefined, ""].includes(page)) {
        page = 1;
      }
      if ([null, undefined, "", 1].includes(limit)) {
        limit = 50;
      }
      const option = {
        limit: limit,
        page: page
      };

      let productPaginate1;
      let result;
      let Data = [];
      if (is_deleted === "true") {
        // console.log("123");
        result = await flight_routes_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        productPaginate1 = await flight_routes_schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            _id: element._id,
            agency_id: element.agency_id,
            flight_type: element.flight_type,
            img: element.img,
            from_flight: element.from_flight,
            to_flight: element.to_flight,
            from_flight_heading: element.from_flight_heading,
            to_flight_heading: element.to_flight_heading,
            is_featured: element.is_featured,
            createdAt: element.createdAt,
            updatedAt: element.updatedAt
          });
        });
      } else {
        // console.log("456");
        result = await flight_routes_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        productPaginate1 = await flight_routes_schema.aggregatePaginate(result, option);
        productPaginate1.docs.forEach((element) => {
          Data.push({
            _id: element._id,
            agency_id: element.agency_id,
            flight_type: element.flight_type,
            img: element.img,
            from_flight: element.from_flight,
            to_flight: element.to_flight,
            from_flight_heading: element.from_flight_heading,
            to_flight_heading: element.to_flight_heading,
            is_featured: element.is_featured,
            createdAt: element.createdAt,
            updatedAt: element.updatedAt
          });
        });
      }

      for (let i = 0; i < result.length; i++) {
        // result[i].img = generateFileDownloadLinkPrefix(req.localHostURL) + result[0].img;
        result[i].img = image_url(fn, result[i].img);
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

      const flight_routes = {
        flight_route: Data,
        pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all flight_route",
        {
          length: 1
        },
        flight_routes
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_flight_routes(req, res) {
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
        flight_type: req.body.flight_type,
        // img: generateFilePathForDB(req.file),
        img: req.files?.img?.[0]?.filename,
        from_flight: req.body.from_flight,
        to_flight: req.body.to_flight,
        from_flight_heading: req.body.from_flight_heading,
        to_flight_heading: req.body.to_flight_heading,
        is_featured: req.body.is_featured,
        is_deleted: req.body.is_deleted
      };

      const update_flight_routes = await flight_routes_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update flight_routes",
        {
          length: 1
        },
        update_flight_routes
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_flight_routes(req, res) {
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

      const delete_flight_routes = await flight_routes_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete flight_routes",
        {
          length: 1
        },
        delete_flight_routes
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
