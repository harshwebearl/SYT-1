const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cms_pages_schema = require("../models/cms_pages.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");

module.exports = class cms_pages_Controller extends BaseController {
  async add_cms_pages(req, res) {
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
      const contents = req.body?.data && reqBodyData?.contents;
      const _contents = req.body?.data && reqBodyData?._contents;
      const banners = req.body?.data && reqBodyData?.banners;
      const _banners = req.body?.data && reqBodyData?._banners;

      const data = {
        ...reqBodyData,
        agency_id: tokenData.id,
        img: req.files?.img?.map((file) => generateFilePathForDB(file))?.[0],
        is_deleted: req.body.is_deleted
        // contents: reqBodyData.contents,
      };

      // CONTENTS
      if (!contents?.length && !req.files?.contents_img?.length) {
        // nothing
        console.log(1);
      } else if (contents?.length) {
        if (req?.files?.contents_img?.length) {
          // old+new
          console.log(2);
          data.contents = [
            ..._contents?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            })),
            ...req.files?.contents_img?.map((item, index) => ({
              // heading: contents?.[index]?.heading,
              // description: contents?.[index]?.description,
              ...(contents?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        } else {
          // old only
          console.log(3);
          data.contents = [
            ..._contents?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            }))
          ];
        }
      } else {
        if (req?.files?.contents_img?.length) {
          // only new
          console.log(4);
          data.contents = [
            ...req.files?.contents_img?.map((item, index) => ({
              // heading: contents?.[index]?.heading,
              // description: contents?.[index]?.description,
              ...(contents?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        }
      }
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

      const add_cms_pages = new cms_pages_schema(data);
      const Add_cms_pages = await add_cms_pages.save();

      return this.sendJSONResponse(
        res,
        "Add cms_pages",
        {
          length: 1
        },
        Add_cms_pages
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cms_pages(req, res) {
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

      const display_cms_pages = await cms_pages_schema.aggregate([
        {
          $match: {
            $or: [{ agency_id: mongoose.Types.ObjectId(tokenData.id) }, { _id: _id }]
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "category_name",
            foreignField: "_id",
            as: "categories"
          }
        }
      ]);

      display_cms_pages[0].img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_pages[0].img;

      display_cms_pages[0].contents.img =
        generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_pages[0].contents.img;

      display_cms_pages[0].banners.img =
        generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_pages[0].banners.img;

      return this.sendJSONResponse(
        res,
        "display  cms_pages",
        {
          length: 1
        },
        display_cms_pages
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_cms_pages(req, res) {
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

      const display_cms_pages = await cms_pages_schema.aggregate([
        {
          $match: {
            agency_id: mongoose.Types.ObjectId(tokenData.id)
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "category_name",
            foreignField: "_id",
            as: "categories"
          }
        }
        //   {
        //     $lookup: {
        //       from: "cms_pages_types",
        //       localField: "cms_pages_type",
        //       foreignField: "_id",
        //       as: "cms_pages_types"
        //     }
        //   },
        //   {
        //     $lookup: {
        //       from: "meal_plans",
        //       localField: "meal_plan",
        //       foreignField: "_id",
        //       as: "meal_plans"
        //     }
        //   }
      ]);

      for (let i = 0; i < display_cms_pages.length; i++) {
        display_cms_pages[i].img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_pages[i]?.img;
      }
      for (let i = 0; i < display_cms_pages.length; i++) {
        if (display_cms_pages[i]["contents"]?.length) {
          display_cms_pages[i]["contents"]["img"] =
            generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_pages[i]?.contents?.img;
        }
      }
      for (let i = 0; i < display_cms_pages.length; i++) {
        if (display_cms_pages[i]["banners"]?.length) {
          display_cms_pages[i]["banners"]["img"] =
            generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_pages[i]?.banners?.img;
        }
      }

      const cms_pagess = {
        cms_pages: display_cms_pages
      };
      return this.sendJSONResponse(
        res,
        "display  cms_pages",
        {
          length: 1
        },
        cms_pagess
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_cms_pages(req, res) {
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
      const contents = req.body?.data && reqBodyData?.contents;
      const _contents = req.body?.data && reqBodyData?._contents;
      const banners = req.body?.data && reqBodyData?.banners;
      const _banners = req.body?.data && reqBodyData?._banners;

      const data = {
        ...reqBodyData,
        agency_id: tokenData.id,
        img: req.files?.img?.map((file) => generateFilePathForDB(file))?.[0],
        is_deleted: req.body.is_deleted,
        status: req.body.status
        // contents: reqBodyData.contents,
      };

      // CONTENTS
      if (!contents?.length && !req.files?.contents_img?.length) {
        // nothing
        console.log(1);
      } else if (contents?.length) {
        if (req?.files?.contents_img?.length) {
          // old+new
          console.log(2);
          data.contents = [
            ..._contents?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            })),
            ...req.files?.contents_img?.map((item, index) => ({
              // heading: contents?.[index]?.heading,
              // description: contents?.[index]?.description,
              ...(contents?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        } else {
          // old only
          console.log(3);
          data.contents = [
            ..._contents?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            }))
          ];
        }
      } else {
        if (req?.files?.contents_img?.length) {
          // only new
          console.log(4);
          data.contents = [
            ...req.files?.contents_img?.map((item, index) => ({
              // heading: contents?.[index]?.heading,
              // description: contents?.[index]?.description,
              ...(contents?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        }
      }
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

      const update_cms_pages = await cms_pages_schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, data);
      return this.sendJSONResponse(
        res,
        "update cms_pages",
        {
          length: 1
        },
        update_cms_pages
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cms_pages(req, res) {
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

      const delete_cms_pages = await cms_pages_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete cms_pages",
        {
          length: 1
        },
        delete_cms_pages
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
