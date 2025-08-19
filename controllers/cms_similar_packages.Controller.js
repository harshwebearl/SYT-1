const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cms_similar_packages_schema = require("../models/cms_similar_packages.Schema");
const mongoose = require("mongoose");

const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");

module.exports = class cms_similar_packages_Controller extends BaseController {
  async add_cms_similar_packages(req, res) {
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
        package_id: req.body.package_id,
        similar_packages_list: req.body.similar_packages_list
      };

      const add_cms_similar_packages = new cms_similar_packages_schema(data);
      const Add_cms_similar_packages = await add_cms_similar_packages.save();

      Add_cms_similar_packages.image = generateDownloadLink(Add_cms_similar_packages.image);

      return this.sendJSONResponse(
        res,
        "add cms_similar_packages ",
        {
          length: 1
        },
        Add_cms_similar_packages
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cms_similar_packages(req, res) {
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

      const display_cms_similar_packages = await cms_similar_packages_schema.find({
        agency_id: tokenData.id,
        _id: _id
      });

      display_cms_similar_packages[0].image =
        generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_similar_packages[0].image;

      return this.sendJSONResponse(
        res,
        "display  cms_similar_packages",
        {
          length: 1
        },
        display_cms_similar_packages
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_cms_similar_packages(req, res) {
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
        result = await cms_similar_packages_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $lookup: {
              from: "package1",
              localField: "package_id",
              foreignField: "_id",
              as: "packages"
            }
          },
          {
            $lookup: {
              from: "package1",
              localField: "similar_packages_list",
              foreignField: "_id",
              as: "similar_packages_list"
            }
          }
        ]);
      } else {
        // console.log("456");
        result = await cms_similar_packages_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $lookup: {
              from: "package1",
              localField: "package_id",
              foreignField: "_id",
              as: "packages"
            }
          },
          {
            $lookup: {
              from: "package1",
              localField: "similar_packages_list",
              foreignField: "_id",
              as: "similar_packages_list"
            }
          }
        ]);
      }

      const cms_similar_packagess = {
        cms_similar_packages: result
      };

      return this.sendJSONResponse(
        res,
        "update cms_similar_packages",
        {
          length: 1
        },
        cms_similar_packagess
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_cms_similar_packages(req, res) {
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
        package_id: req.body.package_id,
        similar_packages_list: req.body.similar_packages_list,
        status: req.body.status,
        is_deleted: req.body.is_deleted
      };

      const update_cms_similar_packages = await cms_similar_packages_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update cms_similar_packages",
        {
          length: 1
        },
        update_cms_similar_packages
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cms_similar_packages(req, res) {
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

      const delete_cms_similar_packages = await cms_similar_packages_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete cms_similar_packages",
        {
          length: 1
        },
        delete_cms_similar_packages
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
