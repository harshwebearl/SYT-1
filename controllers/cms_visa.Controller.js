const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cms_visa_schema = require("../models/cms_visa.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");

module.exports = class cms_visa_Controller extends BaseController {
  async add_cms_visa(req, res) {
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
      const documents = req.body?.data && reqBodyData?.documents;
      const _documents = req.body?.data && reqBodyData?._documents;
      console.log(reqBodyData);

      const data = {
        ...reqBodyData,
        agency_id: tokenData.id,
        img: req.files?.img?.map((file) => generateFilePathForDB(file))?.[0],
        is_deleted: req.body.is_deleted
        // documents: reqBodyData.documents,
      };

      if (!req.body?._documents?.length && !req.files?.icon_img?.length) {
        // nothing
        console.log(1);
      } else if (req.body?._documents?.length) {
        if (req?.files?.icon_img?.length) {
          // old+new
          console.log(2);
          data.documents = [
            ..._documents?.map((item) => ({
              heading: item?.heading,
              description: item?.description,
              icon_img: item?.icon_img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            })),
            ...req.files?.icon_img?.map((item, index) => ({
              heading: documents?.[index]?.heading,
              description: documents?.[index]?.description,
              icon_img: generateFilePathForDB(item)
            }))
          ];
        } else {
          // old only
          console.log(3);
          data.documents = [
            ..._documents?.map((item) => ({
              heading: item?.heading,
              description: item?.description,
              icon_img: item?.icon_img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            }))
          ];
        }
      } else {
        if (req?.files?.icon_img?.length) {
          // only new
          console.log(4);
          data.documents = [
            ...req.files?.icon_img?.map((item, index) => ({
              heading: documents?.[index]?.heading,
              description: documents?.[index]?.description,
              icon_img: generateFilePathForDB(item)
            }))
          ];
        }
      }

      //   console.log("123")
      const add_cms_visa = new cms_visa_schema(data);
      const Add_cms_visa = await add_cms_visa.save();
      console.log(Add_cms_visa);
      Add_cms_visa.img = generateDownloadLink(Add_cms_visa.img);

      // Add_cms_visa.icon_img = generateDownloadLink(Add_cms_visa.icon_img);

      return this.sendJSONResponse(
        res,
        "Add cms_visa",
        {
          length: 1
        },
        Add_cms_visa
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cms_visa(req, res) {
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

      const display_cms_visa = await cms_visa_schema.aggregate([
        {
          $match: {
            $or: [{ agency_id: mongoose.Types.ObjectId(tokenData.id) }, { _id: _id }]
          }
        },
        {
          $lookup: {
            from: "cms_visa_types",
            localField: "descriptions.visa_type",
            foreignField: "_id",
            as: "cms_visa_type"
          }
        },
        {
          $lookup: {
            from: "cms_entry_types",
            localField: "visa_pricing_list.entry_type",
            foreignField: "_id",
            as: "cms_entry_type"
          }
        }
      ]);

      display_cms_visa[0].img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_visa[0].img;

      display_cms_visa[0].documents.icon_img =
        generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_visa[0].documents.icon_img;

      return this.sendJSONResponse(
        res,
        "display  cms_visa",
        {
          length: 1
        },
        display_cms_visa
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_cms_visa(req, res) {
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
        console.log("123");
        result = await cms_visa_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $lookup: {
              from: "cms_visa_types",
              localField: "descriptions.visa_type",
              foreignField: "_id",
              as: "cms_visa_type"
            }
          },
          {
            $lookup: {
              from: "cms_entry_types",
              localField: "visa_pricing_list.entry_type",
              foreignField: "_id",
              as: "cms_entry_type"
            }
          }
        ]);
      } else {
        console.log("456");
        result = await cms_visa_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $lookup: {
              from: "cms_visa_types",
              localField: "descriptions.visa_type",
              foreignField: "_id",
              as: "cms_visa_type"
            }
          },
          {
            $lookup: {
              from: "cms_entry_types",
              localField: "visa_pricing_list.entry_type",
              foreignField: "_id",
              as: "cms_entry_type"
            }
          }
        ]);
      }

      for (let i = 0; i < result.length; i++) {
        result[i].img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].img;
      }
      for (let i = 0; i < result.length; i++) {
        result[i].documents.icon_img = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].documents.icon_img;
      }
      // for (let i = 0; i < display_cms_visa.length; i++) {
      //   display_cms_visa[i].banner_image.photo = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_visa[i].banner_image.photo;
      // }

      const cms_visas = {
        cms_visa: result
      };
      return this.sendJSONResponse(
        res,
        "display  cms_visa",
        {
          length: 1
        },
        cms_visas
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_cms_visa(req, res) {
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
      const documents = req.body?.data && reqBodyData?.documents;
      const _documents = req.body?.data && reqBodyData?._documents;

      const data = {
        ...reqBodyData,
        img: req.files?.img?.map((file) => generateFilePathForDB(file))?.[0],
        status: req.body.status,
        is_deleted: req.body.is_deleted
      };

      // BANNERS
      if (!_documents?.length && !req.files?.documents_img?.length) {
        // nothing
        console.log(1);
      } else if (_documents?.length) {
        if (req?.files?.documents_img?.length) {
          // old+new
          console.log(2);
          data.documents = [
            ..._documents?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            })),
            ...req.files?.documents_img?.map((item, index) => ({
              // heading: documents?.[index]?.heading,
              // description: documents?.[index]?.description,
              ...(documents?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        } else {
          // old only
          console.log(3);
          data.documents = [
            ..._documents?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            }))
          ];
        }
      } else {
        if (req?.files?.documents_img?.length) {
          // only new
          console.log(4);
          data.documents = [
            ...req.files?.documents_img?.map((item, index) => ({
              // heading: documents?.[index]?.heading,
              // description: documents?.[index]?.description,
              ...(documents?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        }
      }

      const update_cms_visa = await cms_visa_schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, data, {
        new: true
      });
      return this.sendJSONResponse(
        res,
        "update cms_visa",
        {
          length: 1
        },
        update_cms_visa
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cms_visa(req, res) {
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

      const delete_cms_visa = await cms_visa_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete cms_visa",
        {
          length: 1
        },
        delete_cms_visa
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
