const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const package_1_Schema = require("../models/package1.Schema");
const mongoose = require("mongoose");
const { generateFilePathForDB } = require("../utils/utility");

module.exports = class package_1_Controller extends BaseController {
  async add_package_1(req, res) {
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
        ...JSON.parse(req.body.data)
      };
      // console.log(req.body.data)
      // console.log(req.files)
      // console.log(1,data)

      if (req.files?.thumb_img) {
        data["overview"]["thumb_img"] = req.files?.thumb_img?.map((file) => generateFilePathForDB(file))?.[0];
      }

      if (req.files?.tour_gallery) {
        data.tour_gallery = data.tour_gallery.map((item, index) => ({
          img_name: item?.img_name,
          img: req.files?.tour_gallery?.map((file) => generateFilePathForDB(file))?.[index]
        }));
      }

      data["overview"]["thumb_img"] = req.files?.thumb_img?.map((file) => generateFilePathForDB(file))?.[0];

      data.tour_gallery = data.tour_gallery.map((item, index) => ({
        img_name: item?.img_name,
        img: req.files?.tour_gallery?.map((file) => generateFilePathForDB(file))?.[index]
      }));

      const add_package_2 = new package_1_Schema(data);
      const Add_package_1 = await add_package_2.save();
      return this.sendJSONResponse(
        res,
        "add package_1",
        {
          length: 1
        },
        Add_package_1
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_package_1(req, res) {
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

      const display_package_1 = await package_1_Schema.find({ agency_id: tokenData.id, _id: _id });

      return this.sendJSONResponse(
        res,
        "display  package_1",
        {
          length: 1
        },
        display_package_1
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_package_1(req, res) {
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
        console.log("123");
        result = await package_1_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: true }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $sort: {
              _id: -1
            }
          }
        ]);
        // productPaginate1 = await package_1_Schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     name: element.name,
        //     category: element.category,
        //     valid_from: element.valid_from,
        //     valid_to: element.valid_to,
        //     URL: element.URL,
        //     Description: element.Description,
        //     og_tag: element.og_tag,
        //     thumbnail: element.thumbnail,
        //     travel_duration: element.travel_duration,
        //     hotels: element.hotels,
        //     itinerary: element.itinerary,
        //     tour_gallery: element.tour_gallery,
        //     transportation: element.transportation,
        //     pricing: element.pricing,
        //     status: element.status,
        //     place_to_visit_ref: element.place_to_visit_ref,
        //     more_details: element.more_details,
        //     sightseeing: element.sightseeing,
        //     travel_by: element.travel_by,
        //     meal_type: element.meal_type,
        //     meal_required: element.meal_required,
        //     price_per_person: element.price_per_person,
        //     total_days: element.total_days,
        //     total_nights: element.total_nights,
        //     destination_id: element.destination_id,
        //     route_map_list: {
        //       city_name: element.route_map_list.city_name,
        //       no_of_days: element.route_map_list.no_of_days
        //     },
        //     include: {
        //       flights: element.include.flights,
        //       hotel_stay: element.include.hotel_stay,
        //       meals: element.include.meals,
        //       transfers: element.include.transfers,
        //       sightseeing: element.include.sightseeing,
        //       cruise: element.include.cruise
        //     },
        //     specialization: {
        //       currency: element.specialization.currency,
        //       price_type: element.specialization.price_type,
        //       price: element.specialization.price,
        //       discount: element.specialization.discount,
        //       tax: element.specialization.tax,
        //       includes: element.specialization.includes
        //     },
        //     package_policy: {
        //       description: element.package_policy.description,
        //       inclusion: element.package_policy.inclusion,
        //       exclusion: element.package_policy.exclusion,
        //       booking_cancellation_and_payment_terms: element.package_policy.booking_cancellation_and_payment_terms,
        //       important_notes_visa_docs: element.package_policy.important_notes_visa_docs,
        //       extra_activity: element.package_policy.extra_activity
        //     },
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
      } else {
        console.log("456");
        result = await package_1_Schema.aggregate([
          {
            $match: {
              $and: [{ is_deleted: { $ne: true } }, { agency_id: mongoose.Types.ObjectId(tokenData.id) }]
            }
          },
          {
            $sort: {
              _id: -1
            }
          },
          {
            $lookup: {
              from: "categories",
              localField: "overview.category",
              foreignField: "_id",
              as: "category"
            }
          },
          {
            $lookup: {
              from: "locations",
              localField: "overview.route_map.locationId",
              foreignField: "_id",
              as: "location"
            }
          },
          {
            $lookup: {
              from: "currencies",
              localField: "specializations.currency",
              foreignField: "_id",
              as: "currencies"
            }
          },
          {
            $lookup: {
              from: "transfer_types",
              localField: "transportation.transfer_type",
              foreignField: "_id",
              as: "transfer_types"
            }
          },
          {
            $lookup: {
              from: "hotels",
              localField: "pricing.items.hotel",
              foreignField: "_id",
              as: "hotels"
            }
          }
        ]);
        // productPaginate1 = await package_1_Schema.aggregatePaginate(result, option);
        // productPaginate1.docs.forEach((element) => {
        //   Data.push({
        //     name: element.name,
        //     category: element.category,
        //     valid_from: element.valid_from,
        //     valid_to: element.valid_to,
        //     URL: element.URL,
        //     Description: element.Description,
        //     og_tag: element.og_tag,
        //     thumbnail: element.thumbnail,
        //     travel_duration: element.travel_duration,
        //     hotels: element.hotels,
        //     itinerary: element.itinerary,
        //     tour_gallery: element.tour_gallery,
        //     transportation: element.transportation,
        //     pricing: element.pricing,
        //     status: element.status,
        //     place_to_visit_ref: element.place_to_visit_ref,
        //     more_details: element.more_details,
        //     sightseeing: element.sightseeing,
        //     travel_by: element.travel_by,
        //     meal_type: element.meal_type,
        //     meal_required: element.meal_required,
        //     price_per_person: element.price_per_person,
        //     total_days: element.total_days,
        //     total_nights: element.total_nights,
        //     destination_id: element.destination_id,
        //     route_map_list: {
        //       city_name: element.route_map_list.city_name,
        //       no_of_days: element.route_map_list.no_of_days
        //     },
        //     include: {
        //       flights: element.include.flights,
        //       hotel_stay: element.include.hotel_stay,
        //       meals: element.include.meals,
        //       transfers: element.include.transfers,
        //       sightseeing: element.include.sightseeing,
        //       cruise: element.include.cruise
        //     },
        //     specialization: {
        //       currency: element.specialization.currency,
        //       price_type: element.specialization.price_type,
        //       price: element.specialization.price,
        //       discount: element.specialization.discount,
        //       tax: element.specialization.tax,
        //       includes: element.specialization.includes
        //     },
        //     package_policy: {
        //       description: element.package_policy.description,
        //       inclusion: element.package_policy.inclusion,
        //       exclusion: element.package_policy.exclusion,
        //       booking_cancellation_and_payment_terms: element.package_policy.booking_cancellation_and_payment_terms,
        //       important_notes_visa_docs: element.package_policy.important_notes_visa_docs,
        //       extra_activity: element.package_policy.extra_activity
        //     },
        //     agency_id: element.agency_id,
        //     is_deleted: element.is_deleted,
        //     createdAt: element.createdAt,
        //     updatedAt: element.updatedAt
        //   });
        // });
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

      const package_1 = {
        customers: result
        // pageInfo: pageInfo
      };

      return this.sendJSONResponse(
        res,
        "display all package_1",
        {
          length: 1
        },
        package_1
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_package_1(req, res) {
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

      // console.log(req.body.data);
      let Data = {
        agency_id: tokenData.id,
        is_deleted: req.body.is_deleted
      };
      if (req.body.data) {
        Data = {
          ...Data,
          ...JSON.parse(req.body.data)
        };
      }
      // console.log(req.files)
      // console.log(1,data)

      if (req.files?.thumb_img) {
        Data["overview"]["thumb_img"] = req.files?.thumb_img?.map((file) => generateFilePathForDB(file))?.[0];
      }

      if (req.files?.tour_gallery) {
        Data.tour_gallery = Data.tour_gallery.map((item, index) => ({
          img_name: item?.img_name,
          img: req.files?.tour_gallery?.map((file) => generateFilePathForDB(file))?.[index]
        }));
      }

      const update_package_1 = await package_1_Schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, Data);
      return this.sendJSONResponse(
        res,
        "update package_1",
        {
          length: 1
        },
        update_package_1
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_package_1(req, res) {
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

      const delete_package_1 = await package_1_Schema.findByIdAndUpdate({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete package_1",
        {
          length: 1
        },
        delete_package_1
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
