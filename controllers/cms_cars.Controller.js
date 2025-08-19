const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cms_cars_Schema = require("../models/cms_cars.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");

module.exports = class cms_cars_Controller extends BaseController {
  async add_cms_cars(req, res) {
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

      const reqBodyData = req.body?.data && JSON.parse(req.body.data);
      const banners = req.body?.data && reqBodyData?.banners;
      const _banners = req.body?.data && reqBodyData?._banners;
      console.log(reqBodyData);

      const data = {
        ...reqBodyData,
        agency_id: tokenData.id,
        img: req.files?.img?.map((file) => generateFilePathForDB(file))?.[0],
        is_deleted: req.body.is_deleted
        // contents: reqBodyData.contents,
      };

      // BANNERS
      if (!_banners?.length && !req.files?.banners_img?.length) {
        // nothing
        console.log(1);
      } else if (_banners?.length) {
        if (req?.files?.banners_img?.length) {
          // old+new
          console.log(2);
          data.banners = [
            ..._banners?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            })),
            ...req.files?.banners_img?.map((item, index) => ({
              // heading: banners?.[index]?.heading,
              // description: banners?.[index]?.description,
              ...(banners?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        } else {
          // old only
          console.log(3);
          data.banners = [
            ..._banners?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            }))
          ];
        }
      } else {
        if (req?.files?.banners_img?.length) {
          // only new
          console.log(4);
          data.banners = [
            ...req.files?.banners_img?.map((item, index) => ({
              // heading: banners?.[index]?.heading,
              // description: banners?.[index]?.description,
              ...(banners?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        }
      }

      const add_cms_cars = new cms_cars_Schema(data);
      const Add_cms_cars = await add_cms_cars.save();
      return this.sendJSONResponse(
        res,
        "add cms_cars",
        {
          length: 1
        },
        Add_cms_cars
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cms_cars(req, res) {
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

      const display_cms_cars = await cms_cars_Schema.find({ agency_id: tokenData.id, _id: _id });

      display_cms_cars[0].img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_cars[0].img;
      return this.sendJSONResponse(
        res,
        "display  cms_cars",
        {
          length: 1
        },
        display_cms_cars
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_cms_cars(req, res) {
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
        result = await cms_cars_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
      } else {
        // console.log("456");
        result = await cms_cars_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
      }

      for (let i = 0; i < result.length; i++) {
        result[i].img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].img;
      }

      const cms_cars = {
        cms_car: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all categories_Schema",
        {
          length: 1
        },
        cms_cars
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_cms_cars(req, res) {
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
      const banners = req.body?.data && reqBodyData?.banners;
      const _banners = req.body?.data && reqBodyData?._banners;
      console.log(reqBodyData);

      const data = {
        ...reqBodyData,
        agency_id: tokenData.id,
        img: req.files?.img?.map((file) => generateFilePathForDB(file))?.[0],
        is_deleted: req.body.is_deleted
        // contents: reqBodyData.contents,
      };

      // BANNERS
      if (!_banners?.length && !req.files?.banners_img?.length) {
        // nothing
        console.log(1);
      } else if (_banners?.length) {
        if (req?.files?.banners_img?.length) {
          // old+new
          console.log(2);
          data.banners = [
            ..._banners?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            })),
            ...req.files?.banners_img?.map((item, index) => ({
              // heading: banners?.[index]?.heading,
              // description: banners?.[index]?.description,
              ...(banners?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        } else {
          // old only
          console.log(3);
          data.banners = [
            ..._banners?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            }))
          ];
        }
      } else {
        if (req?.files?.banners_img?.length) {
          // only new
          console.log(4);
          data.banners = [
            ...req.files?.banners_img?.map((item, index) => ({
              // heading: banners?.[index]?.heading,
              // description: banners?.[index]?.description,
              ...(banners?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        }
      }

      const update_cms_cars = await cms_cars_Schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, data, {
        runValidators: true,
        new: true
      });

      return this.sendJSONResponse(
        res,
        "update cms_cars",
        {
          length: 1
        },
        update_cms_cars
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cms_cars(req, res) {
    try {
      //   console.log("123");
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

      const delete_cms_cars = await cms_cars_Schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete cms_cars",
        {
          length: 1
        },
        delete_cms_cars
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
