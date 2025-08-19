const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const PlacetovisitSchema = require("../models/Place_To_VisitSchema");
const niv = require("node-input-validator");
const placeToVisitSchema = require("../models/Place_To_VisitSchema");
const adminSchema = require("../models/AdminSchema");
const userSchema = require("../models/usersSchema");
const { generateFilePathForDB, generateFileDownloadLinkPrefix, generateDownloadLink } = require("../utils/utility");
const image_url = require("../update_url_path.js");

const fn = "placephoto";
module.exports = class PlacetovisitController extends BaseController {
  async PlacetovisitPhoto(req, res) {
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
        // photo: generateFilePathForDB(req.file),
        photo: req.files.photo[0].filename,
        destination_id: req.body.destination_id,
        name: req.body.name,
        description: req.body.description
      };

      const placephoto = new PlacetovisitSchema(data);
      const placetoVisit = await placephoto.save();

      placetoVisit.photo = generateFileDownloadLinkPrefix(req.localHostURL) + placetoVisit.photo;
      return this.sendJSONResponse(
        res,
        "Placephoto saved",
        {
          length: 1
        },
        placetoVisit
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
  async getPlaceToVisitListByDestId(req, res) {
    try {
      const id = req.params.id;
      const Placetovisit = await PlacetovisitSchema.find({ destination_id: id });
      if (!!Placetovisit?.length) {
        for (let i = 0; i < Placetovisit.length; i++) {
          // Placetovisit[i].photo = generateDownloadLink(Placetovisit[i].photo, req.localHostURL);
          Placetovisit[i].photo = await image_url(fn, Placetovisit[i].photo);
        }

        // Placetovisit[0].photo = generateFileDownloadLinkPrefix(req.localHostURL) + Placetovisit[0].photo;
      }

      return this.sendJSONResponse(
        res,
        "Place to visit data retrived",
        {
          length: 1
        },
        Placetovisit
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_place_to_visit_by_id(req, res) {
    try {
      const id = req.query._id;
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

      const data = await placeToVisitSchema.find({ _id: id });

      return this.sendJSONResponse(
        res,
        "Place to visit data retrived",
        {
          length: 1
        },
        data
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async getPlaceToVisitList(req, res) {
    try {
      const Placetovisit = await PlacetovisitSchema.find({});
      // Placetovisit.map((item) => {
      //   item.photo = generateDownloadLink(item.photo, req.localHostURL);
      // });
      for (let i = 0; i < Placetovisit.length; i++) {
        Placetovisit[i].photo = await image_url(fn, Placetovisit[i].photo);
      }

      return this.sendJSONResponse(
        res,
        "Place to visit data retrived",
        {
          length: 1
        },
        Placetovisit
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_placetovisit(req, res) {
    try {
      const _id = req.query._id;
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
        destination_id: req.body.destination_id,
        name: req.body.name,
        description: req.body.description
      };

      if (req.files && req.files.photo) {
        data.photo = req.files.photo[0].filename;
      }

      const update_data = await placeToVisitSchema.findByIdAndUpdate({ _id: _id }, data, { new: true });
      return this.sendJSONResponse(
        res,
        "Place to visit data retrived",
        {
          length: 1
        },
        update_data
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async DeletePlacedata(req, res) {
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

      const updatedData = await PlacetovisitSchema.findByIdAndDelete({ _id: id });
      return this.sendJSONResponse(
        res,
        "Placetovisit data deleted",
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
};
