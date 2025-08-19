const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cms_activities_schema = require("../models/cms_activities.Schema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
module.exports = class cms_activities_Controller extends BaseController {
  async add_cms_activities(req, res) {
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
      const images = req.body?.data && reqBodyData?.images;
      const _images = req.body?.data && reqBodyData?._images;

      const data = {
        ...reqBodyData,
        agency_id: tokenData.id,
        // image: req.files?.image?.map((file) => generateFilePathForDB(file))?.[0],
        image: req.files?.image?.[0].filename,
        status: req.body.status,
        is_deleted: req.body.is_deleted
      };

      // BANNERS
      if (!_images?.length && !req.files?.images_img?.length) {
        // nothing
        console.log(1);
      } else if (_images?.length) {
        if (req?.files?.images_img?.length) {
          // old+new
          console.log(2);
          data.images = [
            ..._images?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            })),
            ...req.files?.images_img?.map((item, index) => ({
              // heading: images?.[index]?.heading,
              // description: images?.[index]?.description,
              ...(images?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        } else {
          // old only
          console.log(3);
          data.images = [
            ..._images?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            }))
          ];
        }
      } else {
        if (req?.files?.images_img?.length) {
          // only new
          console.log(4);
          data.images = [
            ...req.files?.images_img?.map((item, index) => ({
              // heading: images?.[index]?.heading,
              // description: images?.[index]?.description,
              ...(images?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        }
      }
      const add_cms_activities = new cms_activities_schema(data);
      const Add_cms_activities = await add_cms_activities.save();
      //   console.log(Add_cms_activities);
      //   Add_cms_activities.baner_img = generateDownloadLink(Add_cms_activities.baner_img);

      // Add_cms_activities.icon_img = generateDownloadLink(Add_cms_activities.icon_img);

      return this.sendJSONResponse(
        res,
        "Add cms_activities",
        {
          length: 1
        },
        Add_cms_activities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_cms_activities(req, res) {
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

      const display_cms_activities = await cms_activities_schema.find({ agency_id: tokenData.id, _id: _id });

      display_cms_activities[0].img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_activities[0].img;

      return this.sendJSONResponse(
        res,
        "display  cms_activities",
        {
          length: 1
        },
        display_cms_activities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_cms_activities(req, res) {
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

      const display_cms_activities = await cms_activities_schema.aggregate([
        {
          $match: {
            agency_id: mongoose.Types.ObjectId(tokenData.id)
          }
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "supplier",
            foreignField: "_id",
            as: "suppliers"
          }
        },
        {
          $lookup: {
            from: "cms_destinations",
            localField: "cms_activities_type",
            foreignField: "_id",
            as: "cms_destination"
          }
        }
      ]);

      //   for (let i = 0; i < display_cms_activities.length; i++) {
      //     display_cms_activities[i].thumb_img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_activities[i].thumb_img;
      //   }
      //   for (let i = 0; i < display_cms_activities.length; i++) {
      //     display_cms_activities[i].banner_img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_activities[i].banner_img;
      //   }
      //   for (let i = 0; i < display_cms_activities.length; i++) {
      //     display_cms_activities[i].currency_img = generateFileDownloadLinkPrefix(req.localHostURL) + display_cms_activities[i].currency_img;
      //   }

      const cms_activitiess = {
        cms_activities: display_cms_activities
      };
      return this.sendJSONResponse(
        res,
        "display  cms_activities",
        {
          length: 1
        },
        cms_activitiess
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_cms_activities(req, res) {
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
      const images = req.body?.data && reqBodyData?.images;
      const _images = req.body?.data && reqBodyData?._images;

      const data = {
        ...reqBodyData,
        agency_id: tokenData.id,
        image: req.files?.image?.map((file) => generateFilePathForDB(file))?.[0],
        status: req.body.status,
        activity_type: req.body.activity_type,
        is_deleted: req.body.is_deleted
      };

      // BANNERS
      if (!_images?.length && !req.files?.images_img?.length) {
        // nothing
        console.log(1);
      } else if (_images?.length) {
        if (req?.files?.images_img?.length) {
          // old+new
          console.log(2);
          data.images = [
            ..._images?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            })),
            ...req.files?.images_img?.map((item, index) => ({
              // heading: images?.[index]?.heading,
              // description: images?.[index]?.description,
              ...(images?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        } else {
          // old only
          console.log(3);
          data.images = [
            ..._images?.map((item) => ({
              // heading: item?.heading,
              // description: item?.description,
              ...(item || []),
              img: item?.img?.replace(generateFileDownloadLinkPrefix(req.localHostURL), "")
            }))
          ];
        }
      } else {
        if (req?.files?.images_img?.length) {
          // only new
          console.log(4);
          data.images = [
            ...req.files?.images_img?.map((item, index) => ({
              // heading: images?.[index]?.heading,
              // description: images?.[index]?.description,
              ...(images?.[index] || []),
              img: generateFilePathForDB(item)
            }))
          ];
        }
      }

      const update_cms_activities = await cms_activities_schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        data
      );
      return this.sendJSONResponse(
        res,
        "update cms_activities",
        {
          length: 1
        },
        update_cms_activities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_cms_activities(req, res) {
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

      const delete_cms_activities = await cms_activities_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete cms_activities",
        {
          length: 1
        },
        delete_cms_activities
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
