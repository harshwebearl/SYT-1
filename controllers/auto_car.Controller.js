const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const auto_car_Schema = require("../models/auto_car.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
module.exports = class auto_car_Controller extends BaseController {
  async add_auto_car(req, res) {
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
      console.log(req.files);
      const reqBodyData = req.body?.data && JSON.parse(req.body.data);
      const data = {
        ...reqBodyData,
        agency_id: tokenData.id,
        // img: req.files.path,
        img: req.files.img.originalname,
        is_deleted: req.body.is_deleted
        // documents: reqBodyData.documents,
      };

      const add_auto_car = new auto_car_Schema(data);
      const Add_auto_car = await add_auto_car.save();
      return this.sendJSONResponse(
        res,
        "add auto_car",
        {
          length: 1
        },
        Add_auto_car
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_auto_car(req, res) {
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

      const display_auto_car = await auto_car_Schema.find({ agency_id: tokenData.id, _id: _id });

      // display_auto_car[0].img = generateFileDownloadLinkPrefix(req.localHostURL) + display_auto_car[0].img;
      display_auto_car[0].img = await image_url("auto_car", display_auto_car[0].img);

      return this.sendJSONResponse(
        res,
        "display  auto_car",
        {
          length: 1
        },
        display_auto_car
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_auto_car(req, res) {
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
        result = await auto_car_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await auto_car_Schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     name: element.name,
        //     location_from: element.location_from,
        //     location_to: element.location_to,
        //     category: element.category,
        //     distance: element.distance,
        //     car_type: element.car_type,
        //     price_per_hour: element.price_per_hour,
        //     bata: element.bata,
        //     interstate_toll: element.interstate_toll,
        //     permit: element.permit,
        //     total_price: element.total_price,
        //     inclusions: element.inclusions,
        //     exclusions: element.exclusions,
        //     facilities: element.facilities,
        //     img: element.img,
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        console.log("456");
        result = await auto_car_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await auto_car_Schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     name: element.name,
        //     location_from: element.location_from,
        //     location_to: element.location_to,
        //     category: element.category,
        //     distance: element.distance,
        //     car_type: element.car_type,
        //     price_per_hour: element.price_per_hour,
        //     bata: element.bata,
        //     interstate_toll: element.interstate_toll,
        //     permit: element.permit,
        //     total_price: element.total_price,
        //     inclusions: element.inclusions,
        //     exclusions: element.exclusions,
        //     facilities: element.facilities,
        //     img: element.img,
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      }

      // for (let i = 0; i < result.length; i++) {
      //   result[i].img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].img;
      // }

      for (let i = 0; i < result.length; i++) {
        result[i].img = await image_url("auto_car", result[i].img);
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

      const auto_car = {
        auto_cars: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all categories_Schema",
        {
          length: 1
        },
        auto_car
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_auto_car(req, res) {
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

      const reqBodyData = req.body?.data && JSON.parse(req.body.data);
      const data = {
        ...reqBodyData,
        img: req.files?.img?.map((file) => generateFilePathForDB(file))?.[0],
        is_deleted: req.body.is_deleted,
        status: req.body.status
      };

      const update_auto_car = await auto_car_Schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, data, {
        runValidators: true,
        new: true
      });
      return this.sendJSONResponse(
        res,
        "update auto_car",
        {
          length: 1
        },
        update_auto_car
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_auto_car(req, res) {
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

      const delete_auto_car = await auto_car_Schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete auto_car",
        {
          length: 1
        },
        delete_auto_car
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
