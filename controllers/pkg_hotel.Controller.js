const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const hotel_schema = require("../models/pkg_hotelSchema");
const mongoose = require("mongoose");
const { generateDownloadLink, generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const fn = "pkg_hotel";
module.exports = class pkg_hotel_Controller extends BaseController {
  async add_hotel(req, res) {
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
        hotel_type: req.body.hotel_type,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        pincode: req.body.pincode,
        price: req.body.price,
        address: req.body.address,
        description: req.body.description,
        termsnconditions: req.body.termsnconditions,
        // images: req.files?.images?.map((file) => generateFilePathForDB(file))
        images: req.files.images[0].filename
      };

      const add_hotel = new hotel_schema(data);
      const Add_hotel = await add_hotel.save();
      console.log(Add_hotel);
      Add_hotel.images = Add_hotel.images.map((item) => generateDownloadLink(item));

      return this.sendJSONResponse(
        res,
        "Add hotel",
        {
          length: 1
        },
        Add_hotel
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_hotel(req, res) {
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

      const display_hotel = await hotel_schema.find({ agency_id: tokenData.id, _id: _id });

      // display_hotel[0].logo_image = generateDownloadLink(display_hotel[0].logo_image) + display_hotel[0].logo_image;
      // display_hotel[0].thumb_image = generateDownloadLink(display_hotel[0].thumb_image) + display_hotel[0].thumb_image;
      // display_hotel[0].banner_image =
      //   generateDownloadLink(display_hotel[0].banner_image) + display_hotel[0].banner_image;
      // display_hotel[0].gallery_images = display_hotel[0].gallery_images.map(
      //   (item) => generateDownloadLink(item) + item
      // );

      display_hotel[0].logo_image = await image_url(fn, display_hotel[0].logo_image);
      display_hotel[0].thumb_image = await image_url(fn, display_hotel[0].thumb_image);
      display_hotel[0].banner_image = await image_url(fn, display_hotel[0].banner_image);
      for (let i = 0; i < display_hotel[0].gallery_images.length; i++) {
        display_hotel[0].gallery_images[i] = await image_url(fn, display_hotel[0].gallery_images[i]);
      }

      return this.sendJSONResponse(
        res,
        "display  hotel",
        {
          length: 1
        },
        display_hotel
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_hotel(req, res) {
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
        result = await hotel_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await hotel_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     name: element.name,
        //     agency_id: element.agency_id,
        //     hotel_type: element.hotel_type,
        //     seo_url: element.seo_url,
        //     no_of_stars: element.no_of_stars,
        //     email: element.email,
        //     contact_no: element.contact_no,
        //     logo_image: element.logo_image,
        //     thumb_image: element.thumb_image,
        //     banner_image: element.banner_image,
        //     address1: element.address1,
        //     address2: element.address2,
        //     landmark: element.landmark,
        //     country: element.country,
        //     state: element.state,
        //     city: element.city,
        //     pincode: element.pincode,
        //     latitude: element.latitude,
        //     longitude: element.longitude,
        //     short_description: element.short_description,
        //     long_description: element.long_description,
        //     note: element.note,
        //     gallery_images: element.gallery_images,
        //     amenities: element.amenities,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        // console.log("456");
        result = await hotel_schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          }
        ]);
        // productPaginate1 = await hotel_schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     _id: element._id,
        //     name: element.name,
        //     agency_id: element.agency_id,
        //     hotel_type: element.hotel_type,
        //     seo_url: element.seo_url,
        //     no_of_stars: element.no_of_stars,
        //     email: element.email,
        //     contact_no: element.contact_no,
        //     logo_image: element.logo_image,
        //     thumb_image: element.thumb_image,
        //     banner_image: element.banner_image,
        //     address1: element.address1,
        //     address2: element.address2,
        //     landmark: element.landmark,
        //     country: element.country,
        //     state: element.state,
        //     city: element.city,
        //     pincode: element.pincode,
        //     latitude: element.latitude,
        //     longitude: element.longitude,
        //     short_description: element.short_description,
        //     long_description: element.long_description,
        //     note: element.note,
        //     gallery_images: element.gallery_images,
        //     amenities: element.amenities,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      }

      // for (let i = 0; i < result.length; i++) {
      //   for (let j = 0; j < result[i].images.length; j++) {
      //     result[i].images[j] = generateFileDownloadLinkPrefix(req.localHostURL) + result[i].gallery_images[j];
      //   }
      // }

      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].images.length; j++) {
          result[i].images[j] = image_url(fn, result[i].images[j]);
        }
      }

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

      const hotel = {
        hotels: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all hotel",
        {
          length: 1
        },
        hotel
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_hotel(req, res) {
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
        hotel_type: req.body.hotel_type,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        pincode: req.body.pincode,
        price: req.body.price,
        address: req.body.address,
        description: req.body.description,
        termsnconditions: req.body.termsnconditions,
        images: req.files?.images?.[0]?.filename,
        is_deleted: req.body.is_deleted
      };

      const update_hotel = await hotel_schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, Data);
      return this.sendJSONResponse(
        res,
        "update hotel",
        {
          length: 1
        },
        update_hotel
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_hotel(req, res) {
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

      const delete_hotel = await hotel_schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete hotel",
        {
          length: 1
        },
        delete_hotel
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
