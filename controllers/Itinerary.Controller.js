const BaseController = require("./BaseController");
const itinerarySchema = require("../models/ItinerarySchema");
const packageSchema = require("../models/PackageSchema");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const niv = require("node-input-validator");
const Bidschema = require("../models/bidSchema");
const { generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const { default: mongoose } = require("mongoose");
const fn = "itinary";
module.exports = class ItineraryController extends BaseController {
  async addItinerary(req, res) {
    try {
      const objValidator = new niv.Validator(req.body, {
        package_id: "required",
        title: "required",
        day: "required",
        activity: "required"
        // hotel_name: "required"
      });

      const matched = await objValidator.check();

      if (!matched) {
        throw new Forbidden("Validation Error");
      }

      const data = {
        package_id: req.body.package_id,
        title: req.body.title,
        day: req.body.day,
        activity: req.body.activity,
        hotel_itienrary_id: req.body.hotel_itienrary_id,
        // photo: generateFilePathForDB(req.file),
        photo: req.file ? req.file.filename : "",
        // hotel_name: req.body.hotel_name,
        breakfast_price: req.body.breakfast_price,
        lunch_price: req.body.lunch_price,
        dinner_price: req.body.dinner_price,
        lunch: req.body.lunch,
        dinner: req.body.dinner,
        breakfast: req.body.breakfast,
        room_id: req.body.room_id
      };

      //  req.files.filename ? req.files && req.files.photo && req.files.photo.length > 0 : " "

      const packageData = await packageSchema.find({ _id: data.package_id });
      const itineraryData = await itinerarySchema.find({ package_id: packageData[0]._id });
      let addedData;

      if (packageData[0].total_nights >= itineraryData.length) {
        const addedItineraryData = new itinerarySchema(data);
        addedData = await addedItineraryData.save();
      } else if (packageData[0].total_days >= itineraryData.length) {
        const addedItineraryData = new itinerarySchema(data);
        addedData = await addedItineraryData.save();
      } else if (
        (packageData[0].total_days === itineraryData.length || packageData[0].total_nights === itineraryData.length) &&
        packageData[0].include_service.length !== 0 &&
        packageData[0].exclude_service.length !== 0
      ) {
        await packageSchema.findByIdAndUpdate({ _id: data.package_id }, { status: 1 });
      } else {
        throw new Forbidden("package itinerary is full");
      }
      return this.sendJSONResponse(
        res,
        "itinerary added",
        {
          length: 1
        },
        addedData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async getPackageItinerary(req, res) {
  //   try {
  //     const package_id = req.query._id;
  //     const bid_id = req.query.bid_id;

  //     let itineraryData;
  //     if (!!req.query._id) {
  //       // itineraryData = await itinerarySchema.find({ package_id: package_id });
  //       itineraryData = await itinerarySchema.aggregare([
  //         {
  //           $match: {
  //             package_id: mongoose.Types.ObjectId(package_id)
  //           }
  //         },
  //         {
  //           $lookup: {
  //             from: "hotel_itienraries",
  //             localField: "hotel_itienrary_id",
  //             foreignField: "_id",
  //             as: "hotel_itienrary"
  //           }
  //         }
  //       ])
  //     } else if (!!req.query.bid_id) {
  //       // itineraryData = await itinerarySchema.find({ bid_id: bid_id });
  //       itineraryData = await itinerarySchema.aggregate([
  //         {
  //           $match: {
  //             bid_id: mongoose.Types.ObjectId(bid_id)
  //           }
  //         },
  //         {
  //           $lookup: {
  //             from: "hotel_itienraries",
  //             localField: "hotel_itienrary_id",
  //             foreignField: "_id",
  //             as: "hotel_itienrary"
  //           }
  //         }
  //       ])
  //     }
  //     if (itineraryData.length === 0) {
  //       return res.status(200).json({
  //         success: false,
  //         message: "package itinerary is not found",
  //         data: []
  //       })
  //     }

  //     // itineraryData[0].photo = await image_url(fn, itineraryData[0].photo);
  //     // Check if photo URL of the first item is complete, if not, prepend the base URL using image_url function
  //     // Iterate through each item in itineraryData array and update photo URLs using image_url function
  //     for (let i = 0; i < itineraryData.length; i++) {
  //       if (itineraryData[i].photo && !itineraryData[i].photo.startsWith("http")) {
  //         itineraryData[i].photo = await image_url(fn, itineraryData[i].photo);

  //       }
  //     }

  //     for (let j = 0; j < itineraryData[0].hotel_itienrary.length; j++) {
  //       for (let k = 0; k < itineraryData[0].hotel_itienrary[j].hotel_photo.length; k++) {
  //         itineraryData[0].hotel_itienrary[j].hotel_photo[k] = await image_url("hotel_itienrary", itineraryData[0].hotel_itienrary[j].hotel_photo[k]);
  //       }
  //     }

  //     return this.sendJSONResponse(
  //       res,
  //       "package itinerary is retrived",
  //       {
  //         length: 1
  //       },
  //       itineraryData
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  // async getPackageItinerary(req, res) {
  //   try {
  //     const package_id = req.query._id;
  //     const bid_id = req.query.bid_id;

  //     let itineraryData;
  //     if (package_id) {
  //       itineraryData = await itinerarySchema.aggregate([
  //         {
  //           $match: { package_id: mongoose.Types.ObjectId(package_id) }
  //         },
  //         {
  //           $lookup: {
  //             from: "hotel_itienraries",
  //             localField: "hotel_itienrary_id",
  //             foreignField: "_id",
  //             as: "hotel_itienrary"
  //           }
  //         }
  //       ]);
  //     } else if (bid_id) {
  //       itineraryData = await itinerarySchema.aggregate([
  //         {
  //           $match: { bid_id: mongoose.Types.ObjectId(bid_id) }
  //         },
  //         {
  //           $lookup: {
  //             from: "hotel_itienraries",
  //             localField: "hotel_itienrary_id",
  //             foreignField: "_id",
  //             as: "hotel_itienrary"
  //           }
  //         }
  //       ]);
  //     }

  //     if (!itineraryData || itineraryData.length === 0) {
  //       return res.status(200).json({
  //         success: false,
  //         message: "Package itinerary is not found",
  //         data: []
  //       });
  //     }

  //     // Process image URLs
  //     for (const item of itineraryData) {
  //       if (item.photo && !item.photo.startsWith("http")) {
  //         item.photo = await image_url(fn, item.photo);
  //       }
  //       for (const hotel of item.hotel_itienrary) {
  //         if (hotel.hotel_photo) {
  //           for (let k = 0; k < hotel.hotel_photo.length; k++) {
  //             hotel.hotel_photo[k] = await image_url("hotel_itienrary", hotel.hotel_photo[k]);
  //           }
  //         }
  //       }
  //     }

  //     const hotelDetailsMap = new Map();
  //     for (const item of itineraryData) {
  //       const hotelId = item.hotel_itienrary_id.toString();
  //       if (!hotelDetailsMap.has(hotelId)) {
  //         hotelDetailsMap.set(hotelId, {
  //           ...item.hotel_itienrary[0],
  //           days: [item.day]
  //         });
  //       } else {
  //         const hotel = hotelDetailsMap.get(hotelId);
  //         if (!hotel.days.includes(item.day)) {
  //           hotel.days.push(item.day);
  //         }
  //       }
  //     }

  //     // Convert days array to the required format
  //     hotelDetailsMap.forEach(hotel => {
  //       hotel.days = hotel.days.sort((a, b) => a - b).join(',');
  //     });

  //     // Convert the map to an array
  //     const uniqueHotelsArray = Array.from(hotelDetailsMap.values());

  //     // Update itinerary data with unique hotel details
  //     const responseData = itineraryData.map(item => {
  //       return {
  //         ...item,
  //         hotel_itienrary: uniqueHotelsArray
  //           .filter(hotel => hotel._id.toString() === item.hotel_itienrary_id.toString())
  //       };
  //     });

  //     return this.sendJSONResponse(
  //       res,
  //       "Package itinerary is retrieved",
  //       { length: responseData.length },
  //       responseData
  //     );
  //   } catch (error) {
  //     console.error("Error retrieving package itinerary:", error);
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async getPackageItinerary(req, res) {
    try {
      const package_id = req.query._id;
      const bid_id = req.query.bid_id;

      let itineraryData;
      if (package_id) {
        itineraryData = await itinerarySchema.aggregate([
          {
            $match: { package_id: mongoose.Types.ObjectId(package_id) }
          },
          {
            $lookup: {
              from: "hotel_itienraries",
              localField: "hotel_itienrary_id",
              foreignField: "_id",
              as: "hotel_itienrary"
            }
          }
        ]);
      } else if (bid_id) {
        itineraryData = await itinerarySchema.aggregate([
          {
            $match: { bid_id: mongoose.Types.ObjectId(bid_id) }
          },
          {
            $lookup: {
              from: "hotel_itienraries",
              localField: "hotel_itienrary_id",
              foreignField: "_id",
              as: "hotel_itienrary"
            }
          }
        ]);
      }

      if (!itineraryData || itineraryData.length === 0) {
        return res.status(200).json({
          success: false,
          message: "Package itinerary is not found",
          data: []
        });
      }

      // Process image URLs
      for (const item of itineraryData) {
        if (item.photo && !item.photo.startsWith("http")) {
          item.photo = await image_url(fn, item.photo);
        }
        for (const hotel of item.hotel_itienrary) {
          if (hotel.hotel_photo) {
            for (let k = 0; k < hotel.hotel_photo.length; k++) {
              hotel.hotel_photo[k] = await image_url("hotel_itienrary", hotel.hotel_photo[k]);
            }
          }
        }
      }

      // Filter rooms based on room_id
      for (const item of itineraryData) {
        console.log(item.room_id);
        if (item.room_id) {
          if (item.hotel_itienrary && item.hotel_itienrary.length > 0) {
            for (const hotel of item.hotel_itienrary) {
              if (hotel.rooms && hotel.rooms.length > 0) {
                // Keep only those rooms whose _id matches item.room_id
                hotel.selected_rooms = hotel.rooms.filter((room) => room._id.toString() === item.room_id.toString());
                console.log(hotel.selected_rooms);
              }
            }
          }
        }
      }

      const hotelDetailsMap = new Map();
      for (const item of itineraryData) {
        if (item.hotel_itienrary_id) {
          const hotelId = item.hotel_itienrary_id.toString();
          if (!hotelDetailsMap.has(hotelId)) {
            hotelDetailsMap.set(hotelId, {
              ...item.hotel_itienrary[0],
              days: [item.day],
              selected_rooms: item.hotel_itienrary[0].rooms.filter(
                (room) => room._id.toString() === item.room_id?.toString()
              ),
              itinerary_breakfast: item.breakfast,
              itinerary_lunch: item.lunch,
              itinerary_dinner: item.dinner
            });
          } else {
            const hotel = hotelDetailsMap.get(hotelId);
            if (!hotel.days.includes(item.day)) {
              hotel.days.push(item.day);
            }
          }
        }
      }

      // Convert days array to the required format
      hotelDetailsMap.forEach((hotel) => {
        hotel.days = hotel.days.sort((a, b) => a - b).join(",");
      });

      // Convert the map to an array
      const uniqueHotelsArray = Array.from(hotelDetailsMap.values());

      // Update itinerary data with unique hotel details
      const responseData = itineraryData.map((item) => {
        return {
          ...item,
          hotel_itienrary: uniqueHotelsArray
            .filter((hotel) => item.hotel_itienrary_id && hotel._id.toString() === item.hotel_itienrary_id.toString())
            .map((hotel) => ({
              ...hotel,
              selected_rooms: hotel.rooms.filter((room) => room._id.toString() === item.room_id.toString())
            }))
        };
      });

      return this.sendJSONResponse(
        res,
        "Package itinerary is retrieved",
        { length: responseData.length },
        responseData
      );
    } catch (error) {
      console.error("Error retrieving package itinerary:", error);
      return this.sendErrorResponse(req, res, error);
    }
  }

  async getPackageItineraryById(req, res) {
    try {
      const itineries_id = req.query._id;

      // const itineraryData = await itinerarySchema.findById(itineries_id);
      const itineraryData = await itinerarySchema.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(itineries_id)
          }
        },
        {
          $lookup: {
            from: "hotel_itienraries",
            localField: "hotel_itienrary_id",
            foreignField: "_id",
            as: "hotel_itienrary"
          }
        }
      ]);

      if (itineraryData == null) {
        throw new Forbidden("package itinerary is not found");
      }
      const photoBaseURL = "https://syt-i471.onrender.com/images/itinary/";
      const hotelPhotoBaseURL = "https://syt-i471.onrender.com/images/hotel_itienrary/";

      for (const item of itineraryData) {
        console.log(item.room_id);
        if (item.room_id) {
          if (item.hotel_itienrary && item.hotel_itienrary.length > 0) {
            for (const hotel of item.hotel_itienrary) {
              if (hotel.rooms && hotel.rooms.length > 0) {
                // Keep only those rooms whose _id matches item.room_id
                hotel.selected_rooms = hotel.rooms.filter((room) => room._id.toString() === item.room_id.toString());
              }
            }
          }
        }
      }

      itineraryData.forEach((itinerary) => {
        // Add base URL to photo field
        itinerary.photo = photoBaseURL + itinerary.photo;

        // Add base URL to each hotel photo
        if (itinerary.hotel_itienrary && itinerary.hotel_itienrary.length > 0) {
          itinerary.hotel_itienrary.forEach((hotel) => {
            if (hotel.hotel_photo && Array.isArray(hotel.hotel_photo)) {
              hotel.hotel_photo = hotel.hotel_photo.map((photo) => hotelPhotoBaseURL + photo);
            }
          });
        }
      });

      return this.sendJSONResponse(
        res,
        "package itinerary is retrived",
        {
          length: 1
        },
        itineraryData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async updateItinerary(req, res) {
    try {
      const id = req.query._id;
      const data = {
        title: req.body.title,
        activity: req.body.activity,
        // photo: generateFilePathForDB(req.file),
        // photo: req.file.filename,
        // hotel_name: req.body.package_id,
        hotel_itienrary_id: req.body.hotel_itienrary_id,
        breakfast_price: req.body.breakfast_price,
        lunch_price: req.body.lunch_price,
        dinner_price: req.body.dinner_price,
        room_id: req.body.room_id,
        lunch: req.body.lunch,
        dinner: req.body.dinner,
        breakfast: req.body.breakfast,
        room_id: req.body.room_id
      };

      if (req.file) {
        data.photo = req.file.filename;
      }

      const updatedData = await itinerarySchema.findByIdAndUpdate({ _id: id }, data);
      if (updatedData.length === 0) {
        throw new Forbidden("no itinerary exists!");
      }
      const itinaryData = await itinerarySchema.find({ _id: id });
      // itinaryData[0].photo = generateFileDownloadLinkPrefix(req.localHostURL) + itinaryData[0].photo;
      itinaryData[0].photo = await image_url(fn, itinaryData[0].photo);
      return this.sendJSONResponse(
        res,
        "itinerary updated",
        {
          length: 1
        },
        itinaryData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_bid_itinerary(req, res) {
    try {
      const bid_id = req.query.bid_id;
      const day = req.query.day;

      const data = {
        title: req.body.title,
        activity: req.body.activity,
        day: req.body.day,
        // photo: generateFilePathForDB(req.file),
        // photo: req.file.filename,
        hotel_name: req.body.hotel_name,
        hotel_itienrary_id: req.body.hotel_itienrary_id,
        breakfast_price: req.body.breakfast_price,
        lunch_price: req.body.lunch_price,
        dinner_price: req.body.dinner_price,
        lunch: req.body.lunch,
        dinner: req.body.dinner,
        breakfast: req.body.breakfast,
        room_id: req.body.room_id
      };

      if (req.file) {
        data.photo = req.file.filename;
      }

      const update_bid_itinerary = await itinerarySchema.findOneAndUpdate({ bid_id: bid_id, day: day }, data, {
        new: true
      });

      return this.sendJSONResponse(
        res,
        "itinerary updated",
        {
          length: 1
        },
        update_bid_itinerary
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async deleteItinerary(req, res) {
    try {
      const id = req.query._id;
      const deleteItinerary = await itinerarySchema.findByIdAndDelete({ _id: id });
      if (deleteItinerary === null) {
        throw new Forbidden("itinarary is not founded!");
      }
      const packageData = await packageSchema.findByIdAndUpdate({ _id: deleteItinerary.package_id }, { status: 0 });

      return this.sendJSONResponse(
        res,
        "delete itinerary",
        {
          length: 1
        },
        packageData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_bid_itinerary(req, res) {
    try {
      const bid_id = req.query.bid_id;
      const day = req.query.day;

      const delete_bid_itinerary = await itinerarySchema.deleteOne({ bid_id: bid_id, day: day });
      console.log(delete_bid_itinerary);
      if (delete_bid_itinerary === null) {
        throw new Forbidden("itinarary is not founded!");
      }

      return this.sendJSONResponse(
        res,
        "delete itinerary",
        {
          length: 1
        },
        delete_bid_itinerary
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async addBidItinerary(req, res) {
    try {
      console.log("demo");
      const objValidator = new niv.Validator(req.body, {
        bid_id: "required",
        title: "required",
        day: "required",
        activity: "required"
        // hotel_name: "required"
      });

      const matched = await objValidator.check();

      if (!matched) {
        throw new Forbidden("Validation Error");
      }

      const data = {
        bid_id: req.body.bid_id,
        hotel_itienrary_id: req.body.hotel_itienrary_id,
        title: req.body.title,
        day: req.body.day,
        activity: req.body.activity,
        // photo: generateFilePathForDB(req.file),
        photo: req.file ? req.file.filename : "",
        breakfast_price: req.body.breakfast_price,
        lunch_price: req.body.lunch_price,
        dinner_price: req.body.dinner_price,
        room_id: req.body.room_id,
        lunch: req.body.lunch,
        dinner: req.body.dinner,
        breakfast: req.body.breakfast
        // hotel_name: req.body.hotel_name
      };

      const BidPackage = await Bidschema.find({ _id: data.bid_id });
      console.log(BidPackage);
      const itineraryData = await itinerarySchema.find({ bid_id: BidPackage[0]._id });
      console.log(itineraryData);
      let addedData;
      // console.log(BidPackage);
      console.log(itineraryData.length);

      if (Math.max(BidPackage[0].total_days, BidPackage[0].total_nights) > itineraryData.length) {
        console.log("MAX " + Math.max(BidPackage[0].total_days, BidPackage[0].total_nights));

        const addedItineraryData = new itinerarySchema(data);
        addedData = await addedItineraryData.save();
      } else {
        throw new Forbidden("package itinerary is full");
      }

      return this.sendJSONResponse(
        res,
        "itinerary added",
        {
          length: 1
        },
        addedData
      );
    } catch (error) {
      console.log(error);
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async hotel_itinerary_find_all(req, res) {
    try {
      let { bid_id } = req.query;

      let aggregateResult = await itinerarySchema.aggregate([
        {
          $match: { bid_id: mongoose.Types.ObjectId(bid_id) }
        },
        {
          $lookup: {
            from: "hotel_itienraries",
            localField: "hotel_itienrary_id",
            foreignField: "_id",
            as: "hotel_itienrary"
          }
        },
        {
          $unwind: {
            path: "$hotel_itienrary",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: "$hotel_itienrary_id",
            title: { $first: "$title" },
            day: { $push: "$day" }, // Collect all days for each hotel itinerary
            activity: { $first: "$activity" },
            photo: { $first: "$photo" },
            bid_id: { $first: "$bid_id" },
            hotel_itienrary: { $first: "$hotel_itienrary" } // Group all hotel itinerary details
          }
        },
        {
          $project: {
            _id: 0,
            title: 1,
            activity: 1,
            photo: 1,
            bid_id: 1,
            hotel_itienrary_id: "$_id",
            hotel_name: "$hotel_itienrary.hotel_name",
            hotel_address: "$hotel_itienrary.hotel_address",
            hotel_city: "$hotel_itienrary.hotel_city",
            hotel_state: "$hotel_itienrary.hotel_state",
            hotel_type: "$hotel_itienrary.hotel_type",
            other: "$hotel_itienrary.other",
            hotel_description: "$hotel_itienrary.hotel_description",
            days: {
              $reduce: {
                input: "$day",
                initialValue: "",
                in: {
                  $cond: {
                    if: { $eq: ["$$value", ""] },
                    then: { $toString: "$$this" },
                    else: { $concat: ["$$value", "/", { $toString: "$$this" }] }
                  }
                }
              }
            }
          }
        }
      ]);

      console.log(aggregateResult);

      return this.sendJSONResponse(
        res,
        "hotel itinerary found successfully",
        {
          length: aggregateResult.length
        },
        aggregateResult
      );
    } catch (error) {
      console.log(error);
      return this.sendErrorResponse(req, res, error);
    }
  }
};
