const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const siderSchema = require("../models/sliderSchema");
const BaseController = require("./BaseController");
const niv = require("node-input-validator");
const userSchema = require("../models/usersSchema");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const fn = "slider";
module.exports = class siderController extends BaseController {
  //add siders
  async addsider(req, res) {
    try {
      // const tokenData = req.userData;
      // const adminData = await adminSchema.find({ _id: tokenData.id });
      // if (adminData === null) {
      //   throw new NotFound("you are not admin");
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
        // photo: req.files?.photo?.map((file) => generateFilePathForDB(file))
        photo: req.files.photo[0].filename
      };

      const addsiders = new siderSchema(data);
      const siderData = await addsiders.save();
      return this.sendJSONResponse(
        res,
        "sider added",
        {
          length: 1
        },
        siderData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  //display sider from super admin
  // async getAllsider(req, res) {
  //     try {
  //         const siderData = await siderSchema.find();
  //         if (siderData.length === 0) {
  //             throw NotFound("sider is not available");
  //         }
  //         return this.sendJSONResponse(
  //             res,
  //             "data retived",
  //             {
  //                 length: 1
  //             },
  //             siderData
  //         );
  //     } catch (error) {
  //         if (error instanceof NotFound) {
  //             console.log(error); // throw error;
  //         }
  //         return this.sendErrorResponse(req, res, error);
  //     }
  // }

  // async getsider(req, res) {
  //     try {
  //         const siderData = await siderSchema.find({ status: 1 });
  //         if (siderData.length === 0) {
  //             throw NotFound("sider is not available");
  //         }
  //         return this.sendJSONResponse(
  //             res,
  //             "data retived",
  //             {
  //                 length: 1
  //             },
  //             siderData
  //         );
  //     } catch (error) {
  //         if (error instanceof NotFound) {
  //             console.log(error); // throw error;
  //         }
  //         return this.sendErrorResponse((req, res, error));
  //     }
  // }

  //update sider
  async updatesider(req, res) {
    try {
      const id = req.query._id;
      // const tokenData = req.userData;
      // const adminData = await adminSchema.find({ _id: tokenData.id });
      // if (adminData === null) {
      //   throw new NotFound("you are not admin");
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
        // photo: req.files?.photo?.map((file) => generateFilePathForDB(file))
        photo: req.files?.photo?.map((file) => file.filename)
      };

      const updatedsider = await siderSchema.updateOne({ _id: id }, data);
      return this.sendJSONResponse(
        res,
        "sider updated",
        {
          length: 1
        },
        updatedsider
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  //delete sider
  async deletesider(req, res) {
    try {
      const id = req.params.id;
      // const tokenData = req.userData;
      // const adminData = await adminSchema.find({ _id: tokenData.id });
      // if (adminData === null) {
      //   throw new NotFound("you are not admin");
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

      const updatedsider = await siderSchema.findByIdAndDelete({ _id: id });
      return this.sendJSONResponse(
        res,
        "sider updated",
        {
          length: 1
        },
        updatedsider
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse((req, res, error));
    }
  }
};
