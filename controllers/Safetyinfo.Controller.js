const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const SafetyinfoSchema = require("../models/SafetyinfoSchema");
const adminSchema = require("../models/AdminSchema");
const userSchema = require("../models/usersSchema");
const DescriptionSchema = require("../models/DescriptionSchema");
const { generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const fn = "Safetyinfo";
module.exports = class SafetyInfoController extends BaseController {
  async AddSafetyinfo(req, res) {
    try {
      // const tokenData = req.userData;
      // const adminData = await adminSchema({ _id: tokenData.id });

      // if (adminData.length === 0) {
      //   throw new Forbidden("you are not admin");
      // }
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData);
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const data = {
        // safetyinfo_photo: generateFilePathForDB(req.file),
        safetyinfo_photo: req.files.safetyinfo[0].filename,
        safetyinfo_title: req.body.safetyinfo_title,
        description_id: req.body.description_id
      };
      const AddSafetyinfo = new SafetyinfoSchema(data);
      const insertSafetyinfo = await AddSafetyinfo.save();
      return this.sendJSONResponse(
        res,
        "data updated",
        {
          length: 1
        },
        insertSafetyinfo
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async Displaysafetyinfo(req, res) {
    try {
      const DisplaySaftyinfo = await DescriptionSchema.aggregate([
        {
          $lookup: {
            from: "safetyinfos",
            localField: "_id",
            foreignField: "description_id",
            as: "safetyinfo"
          }
        },
        {
          $set: {
            safetyinfo: {
              $map: {
                input: "$safetyinfo",
                in: {
                  $mergeObjects: [
                    "$$this",
                    {
                      safetyinfo_photo: {
                        // $concat: ["+1", "$$this.number"]
                        $concat: [`${generateFileDownloadLinkPrefix(req.localHostURL)}`, "$$this.safetyinfo_photo"]
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      ]);

      const info = {
        _id: DisplaySaftyinfo[0]._id,
        description: DisplaySaftyinfo[0].description,
        __v: DisplaySaftyinfo[0].__v
      };
      const safetyinfo = DisplaySaftyinfo[0].safetyinfo;
      const result = {
        info: info,
        safetyinfo: safetyinfo
      };
      return this.sendJSONResponse(
        res,
        "Display data",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
