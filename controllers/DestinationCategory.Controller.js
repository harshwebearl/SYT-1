const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const niv = require("node-input-validator");
const destinationCategorySchema = require("../models/DestinationCategorySchema");
const adminSchema = require("../models/AdminSchema");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const userSchema = require("../models/usersSchema");
const image_url = require("../update_url_path.js");
const fn = "dastinationcategory";
module.exports = class DestinestionController extends BaseController {
  async imagestore(req, res) {
    try {
      const tokenData = req.userData;

      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      // const tokenData = req.userData;
      // const adminData = await adminSchema.find({ _id: tokenData.id });
      // if (adminData === null) {
      //   throw new NotFound("you are not admin");
      // }
      const data = {
        // photo: generateFilePathForDB(req.file),
        photo: req.file.filename,
        category_name: req.body.category_name
      };
      console.log(data);
      const photoinsert = new destinationCategorySchema(data);
      const categoryData = await photoinsert.save();

      // categoryData.photo = generateDownloadLink(categoryData.photo);
      return this.sendJSONResponse(
        res,
        "destination data saved",
        {
          length: 1
        },
        categoryData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async ShowDestinationData(req, res) {
    try {
      const DestinationData = await destinationCategorySchema.find({ status: true });
      if (DestinationData.length === 0) {
        throw new Forbidden("Destination Data Not Found");
      }
      DestinationData.forEach((element) => {
        // element.photo = generateDownloadLink(element.photo, req.localHostURL);
      });
      for (let i = 0; i < DestinationData.length; i++) {
        DestinationData[i].photo = await image_url(fn, DestinationData[i].photo);
      }

      return this.sendJSONResponse(
        res,
        "data retrived",
        {
          length: 6
        },
        DestinationData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_category_status(req, res) {
    try {
      // console.log("123");
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
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const id = req.query._id;
      const destinationData = await destinationCategorySchema.find({ _id: id });
      if (destinationData === null) {
        throw new NotFound("Destination Data Not Found");
      }
      const data = {
        status: req.body.status
      };
      const update_category_status = await destinationCategorySchema.findByIdAndUpdate({ _id: id }, data);

      return this.sendJSONResponse(
        res,
        "category status updated",
        {
          length: 1
        },
        update_category_status
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async updateDestinationdetail(req, res) {
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
      const id = req.params.id;
      const destinationData = await destinationCategorySchema.find({ _id: id });
      if (destinationData === null) {
        throw new NotFound("Destination Data Not Found");
      }
      const data = {
        category_name: req.body.category_name,
        // photo: generateFilePathForDB(req.file)
        photo: req.file.filename
      };
      const updatedData = await destinationCategorySchema.findByIdAndUpdate({ _id: id }, data, { new: true });

      return this.sendJSONResponse(
        res,
        "data updated",
        {
          length: 1
        },
        updatedData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async DeleteDestinationcategory(req, res) {
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

      const id = req.params.id;
      const deletedData = await destinationCategorySchema.findByIdAndUpdate({ _id: id }, { status: 0 });
      if (deletedData.length === 0) {
        throw new Forbidden("no category exist");
      }
      return this.sendJSONResponse(
        res,
        "Destination category deleted",
        {
          length: 1
        },
        deletedData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
