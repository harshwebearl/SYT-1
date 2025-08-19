const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const amenities_schema = require("../models/amenities.Schema");
const mongoose = require("mongoose");
const image_url = require("../update_url_path.js");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const fn = "amenities";
module.exports = class amenities_Controller extends BaseController {
  async add_amenities(req, res) {
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
        icon: req.body.icon,
        // icon_img: generateFilePathForDB(req.file)
        icon_img: req.files?.icon_img?.[0]?.filename
      };

      const add_amenities = new amenities_schema(data);
      const Add_amenities = await add_amenities.save();

      // Add_amenities.icon_img = generateDownloadLink(Add_amenities.icon_img);

      return this.sendJSONResponse(
        res,
        "add amenities ",
        {
          length: 1
        },
        Add_amenities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_amenities(req, res) {
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

      const display_amenities = await amenities_schema.find({ agency_id: tokenData.id, _id: _id });

      // display_amenities[0].icon_img = generateFileDownloadLinkPrefix(req.localHostURL) + display_amenities[0].icon_img;
      display_amenities[0].icon_img = await image_url(fn, display_amenities[0].icon_img);

      return this.sendJSONResponse(
        res,
        "display  amenities",
        {
          length: 1
        },
        display_amenities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_amenities(req, res) {
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

      const is_deleted = req.query.is_deleted;
      // let { limit, page, is_deleted } = req.query;
      // if ([null, undefined, "", 1].includes(limit)) {
      //   limit = 50;
      // }
      // if ([null, undefined, ""].includes(page)) {
      //   page = 1;
      // }

      // const option = {
      //   limit: limit,
      //   page: page
      // };
      // console.log(option);
      // const match = {};
      // if (is_deleted) {
      //  is_deleted = is_deleted;
      // }
      // let productPaginate1;
      let result;
      // let Data=[];
      if (is_deleted === "true") {
        console.log("123");
        result = await amenities_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await amenities_schema.aggregatePaginate(result, option);
        // console.log(productPaginate1);
      } else {
        // console.log("456");
        result = await amenities_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        //  productPaginate1 = await amenities_schema.aggregatePaginate(result, option);
        // //  console.log(productPaginate1);
        //  productPaginate1.docs.forEach((element) => {
        //   element.icon_img = generateFileDownloadLinkPrefix(req.localHostURL)  + element.icon_img[0];
        //    Data.push({
        //     _id: element._id,
        //     name: element.name,
        //     icon: element.icon,
        //     icon_img: element.icon_img,
        //     agency_id: element.agency_id,
        //     is_deleted:element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt,
        //    })
        //  })
        // productPaginate1 = await amenities_schema.aggregatePaginate(result, option);
        // console.log(productPaginate1);
      }
      for (let i = 0; i < result.length; i++) {
        // result[i].icon_img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].icon_img;
        result[i].icon_img = image_url(fn, result[i].icon_img);
      }

      // productPaginate1 = await amenities_schema.aggregatePaginate(result, option);
      //  console.log(productPaginate1);

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

      const amenities = {
        amenitie: result
        // pageinfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all amenities",
        {
          length: 1
        },
        amenities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_amenities(req, res) {
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
        icon: req.body.icon,
        name: req.body.name,
        // icon:req.file.filename,
        // icon_img: generateFilePathForDB(req.file),
        icon_img: req.files?.icon_img?.[0],
        is_deleted: req.body.is_deleted
      };

      const update_amenities = await amenities_schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, Data);
      return this.sendJSONResponse(
        res,
        "update amenities",
        {
          length: 1
        },
        update_amenities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_amenities(req, res) {
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

      const delete_amenities = await amenities_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete amenities",
        {
          length: 1
        },
        delete_amenities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
