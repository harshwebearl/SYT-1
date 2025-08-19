const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const qutation_schema = require("../models/quotation.schema");
const mongoose = require("mongoose");
const { generateFilePathForDB } = require("../utils/utility");

module.exports = class qutation_Controller extends BaseController {
  async add_qutation(req, res, next) {
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
      delete data._id;
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

      // data["overview"]["thumb_img"] = req.files?.thumb_img?.map((file) => generateFilePathForDB(file))?.[0];

      // data.tour_gallery = data.tour_gallery.map((item, index) => ({
      //   img_name: item?.img_name,
      //   img: req.files?.tour_gallery?.map((file) => generateFilePathForDB(file))?.[index]
      // }));
      console.log(1, data);
      const add_qutation = new qutation_schema(data);
      const Add_qutation = await add_qutation.save();
      return this.sendJSONResponse(
        res,
        "add qutation",
        {
          length: 1
        },
        Add_qutation
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_qutation(req, res) {
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

      const display_qutation = await qutation_schema.find({ agency_id: tokenData.id, _id: _id });

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

  async display_all_qutation(req, res) {
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
        result = await qutation_schema.aggregate([
          {
            $match: {
              $and: [
                { is_deleted: true },
                { agency_id: mongoose.Types.ObjectId(tokenData.id) },
                ...(!!req.query.stage ? [{ stage: req.query.stage }] : []),
                ...(!!req.query.lead_id ? [{ lead_id: mongoose.Types.ObjectId(req.query.lead_id) }] : [])
              ]
            }
          },
          {
            $sort: {
              _id: -1
            }
          },
          {
            lookup: {
              from: "hotel_types",
              localField: "lead_id",
              foreignField: "_id",
              as: "hotel_types"
            }
          },
          {
            lookup: {
              from: "hotel_types",
              localField: "hotel_type",
              foreignField: "_id",
              as: "hotel_type"
            }
          },
          {
            lookup: {
              from: "locations",
              localField: "itineraries.city",
              foreignField: "_id",
              as: "city"
            }
          },
          {
            lookup: {
              from: "transfer_types",
              localField: "transportation.transfer_type",
              foreignField: "_id",
              as: "transfer_type"
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
        result = await qutation_schema.aggregate([
          {
            $match: {
              $and: [
                { is_deleted: { $ne: true } },
                { agency_id: mongoose.Types.ObjectId(tokenData.id) },
                ...(!!req.query.stage ? [{ stage: req.query.stage }] : []),
                ...(!!req.query.lead_id ? [{ lead_id: mongoose.Types.ObjectId(req.query.lead_id) }] : [])
              ]
            }
          },
          {
            $sort: {
              _id: -1
            }
          },
          {
            lookup: {
              from: "hotel_types",
              localField: "lead_id",
              foreignField: "_id",
              as: "hotel_types"
            }
          },
          {
            lookup: {
              from: "hotel_types",
              localField: "hotel_type",
              foreignField: "_id",
              as: "hotel_type"
            }
          },
          {
            lookup: {
              from: "locations",
              localField: "itineraries.city",
              foreignField: "_id",
              as: "city"
            }
          },
          {
            lookup: {
              from: "transfer_types",
              localField: "transportation.transfer_type",
              foreignField: "_id",
              as: "transfer_type"
            }
          }
        ]);
        // productPaginate1 = await qutation_schema.aggregatePaginate(result, option);
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

      const qutation = {
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

  async finalizequtation(req, res) {
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
      const updateOther = await qutation_schema.updateMany(
        { lead_id: req.query.lead_id, agency_id: tokenData.id },
        {
          stage: "opportunity"
        }
      );
      const update_qutation = await qutation_schema.findByIdAndUpdate(
        { _id: req.query._id, agency_id: tokenData.id },
        { stage: "finalized" }
      );
      return this.sendJSONResponse(
        res,
        "update qutation",
        {
          length: 1
        },
        update_qutation
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_qutation(req, res, next) {
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
      delete data._id;
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

      // data["overview"]["thumb_img"] = req.files?.thumb_img?.map((file) => generateFilePathForDB(file))?.[0];

      // data.tour_gallery = data.tour_gallery.map((item, index) => ({
      //   img_name: item?.img_name,
      //   img: req.files?.tour_gallery?.map((file) => generateFilePathForDB(file))?.[index]
      // }));
      console.log(1, data);
      // const add_package_2 = new package_1_Schema(data);
      // const Add_package_1 = await add_package_2.save();
      let query = {};
      if (!req.query._id) {
      } else {
        query._id = req.query._id;
      }
      const Add_qutation = await qutation_schema.findOneAndUpdate(query, data, {
        returnNewDocument: true,
        upsert: true
      });
      return this.sendJSONResponse(
        res,
        "add qutation",
        {
          length: 1
        },
        Add_qutation
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_qutation(req, res) {
    // NOT NEEDED SO YOU CAN DELETE THIS FUNCTION
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

      const update_qutation = await qutation_schema.findByIdAndUpdate({ _id: _id, agency_id: tokenData.id }, Data, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      });
      return this.sendJSONResponse(
        res,
        "update qutation",
        {
          length: 1
        },
        update_qutation
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_qutation(req, res) {
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

      const delete_qutation = await qutation_schema.findByIdAndDelete({ _id: _id }, Data);

      return this.sendJSONResponse(
        res,
        "delete qutation",
        {
          length: 1
        },
        delete_qutation
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
