const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const PackageSchema = require("../models/PackageSchema");
const agencySchema = require("../models/Agency_personalSchema");
const adminSchema = require("../models/AdminSchema");
const destinationSchema = require("../models/DestinationSchema");
const packageSchema = require("../models/PackageSchema");
const destinationCategorySchema = require("../models/DestinationCategorySchema");
const userSchema = require("../models/usersSchema");
const mongoose = require("mongoose");
const niv = require("node-input-validator");
const { generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const moment = require("moment");
const package_profit_margin = require("../models/package_profit_margin.js");
const Notificationschema = require("../models/NotificationSchema.js");
const { getReceiverSocketId, io } = require("../socket/socket.js");
const ReviewSchema = require("../models/reviewSchema.js");

module.exports = class PackageController extends BaseController {
  async AddPackages(req, res) {
    try {
      if (!req.body.name || req.body.name.trim() === "") {
        throw new Forbidden("Package name is required");
      }

      // if (!req.body.total_days || typeof req.body.total_days.trim() === "") {
      //   throw new Forbidden("Total days is required and must be a number");
      // }

      // if (!req.body.total_nights || typeof req.body.total_nights.trim() === "") {
      //   throw new Forbidden("Total nights is required and must be a number");
      // }

      if (!req.body.destination || req.body.destination.trim() === "") {
        throw new Forbidden("Destination is required");
      }

      if (req.body.meal_required === undefined || req.body.meal_required === null) {
        throw new Forbidden("Meal requirement status is required");
      }

      if (!req.body.meal_type || req.body.meal_type.trim() === "") {
        throw new Forbidden("Meal type is required");
      }

      if (!req.body.travel_by || req.body.travel_by.trim() === "") {
        throw new Forbidden("Travel by field is required");
      }

      if (!req.body.more_details || req.body.more_details.trim() === "") {
        throw new Forbidden("More details field is required");
      }

      if (!req.body.room_sharing || req.body.room_sharing.trim() === "") {
        throw new Forbidden("Room sharing field is required");
      }

      if (!req.body.package_type || req.body.package_type.trim() === "") {
        throw new Forbidden("Package type is required");
      }

      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }

      const userData = await userSchema.findById(tokenData.id);
      if (userData.role !== "admin" && userData.role !== "agency") {
        throw new Forbidden("You are not authorized.");
      }

      // Get price and date arrays
      // const packageStartDate = new Date(req.body.start_date);
      // const packageEndDate = new Date(req.body.end_date);

      // Get price and date arrays
      const priceAndDateArray = req.body.price_and_date;

      // Validate for overlapping or duplicate date ranges
      for (let i = 0; i < priceAndDateArray.length; i++) {
        const currentStartDate = new Date(priceAndDateArray[i].price_start_date);
        const currentEndDate = new Date(priceAndDateArray[i].price_end_date);

        // Ensure the start date is before the end date
        if (currentStartDate >= currentEndDate) {
          throw new Forbidden(`Dates are mismatched, please change the dates in Price Range`);
        }

        // Ensure price start and end dates fall within the package start and end dates
        // if (currentStartDate < packageStartDate || currentEndDate > packageEndDate) {
        //   throw new Forbidden(`Invalid Date`);
        // }

        // Check for overlapping date ranges within the price_and_date array
        for (let j = 0; j < priceAndDateArray.length; j++) {
          if (i !== j) {
            // Don't compare the same element
            const nextStartDate = new Date(priceAndDateArray[j].price_start_date);
            const nextEndDate = new Date(priceAndDateArray[j].price_end_date);

            // Check for overlapping date ranges
            if (currentStartDate <= nextEndDate && currentEndDate >= nextStartDate) {
              throw new Forbidden(`Dates are mismatched, please change the dates in Price Range`);
            }
          }
        }
      }

      // Prepare package data to insert
      const data = {
        user_id: tokenData.id,
        name: req.body.name,
        price_and_date: req.body.price_and_date,
        total_days: req.body.total_days,
        total_nights: req.body.total_nights,
        destination: req.body.destination,
        destination_category_id: req.body.destination_category_id,
        meal_required: req.body.meal_required,
        meal_type: req.body.meal_type,
        travel_by: req.body.travel_by,
        sightseeing: req.body.sightseeing,
        hotel_type: req.body.hotel_type,
        more_details: req.body.more_details,
        place_to_visit_id: req.body.place_to_visit_id,
        include_service: req.body.include_service,
        exclude_service: req.body.exclude_service,
        room_sharing: req.body.room_sharing,
        package_type: req.body.package_type,
        status: req.body.status,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        lunch_price: req.body.lunch_price,
        dinner_price: req.body.dinner_price,
        breakfast_price: req.body.breakfast_price,
        lunch: req.body.lunch,
        dinner: req.body.dinner,
        breakfast: req.body.breakfast
      };

      // Insert the new package
      const Packagedatainsert = new PackageSchema(data);
      const packageItem = await Packagedatainsert.save();

      if (userData.role === "agency") {
        const agencyNotification = await Notificationschema.create({
          user_id: tokenData.id,
          title: "Your New Package Has Been Added!",
          text: `Hello, your package '${req.body.name}' has been successfully added to our system. It will be reviewed and processed shortly. Thank you for your contribution!`,
          user_type: "agency"
        });

        const adminSocketId = getReceiverSocketId(tokenData.id);
        if (adminSocketId) {
          io.to(adminSocketId).emit("newNotification", agencyNotification);
        }
      } else if (userData.role === "admin") {
        const adminNotification = await Notificationschema.create({
          user_id: tokenData.id,
          title: "New Package Added",
          text: `A new package '${req.body.name}' has been added.`,
          user_type: "admin"
        });

        const adminSocketId = getReceiverSocketId(tokenData.id);
        if (adminSocketId) {
          io.to(adminSocketId).emit("newNotification", adminNotification);
        }
      }

      return this.sendJSONResponse(
        res,
        "Package successfully added",
        {
          length: 1
        },
        packageItem
      );
    } catch (error) {
      if (error instanceof Forbidden) {
        console.log(error.message);
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async getPackageDetails(req, res) {
  //   try {
  //     const package_id = req.query.package_id;
  //     console.log(123);

  //     const baseHotelPhotoURL = "https://start-your-tour-api.onrender.com/images/hotel_itienrary/";

  //     const packageProfitMargin = await package_profit_margin.find();

  //     const packageData = await PackageSchema.aggregate([
  //       // {
  //       //   $match: {
  //       //     $and: [{ _id: mongoose.Types.ObjectId(package_id) }, { status: true }]
  //       //   }
  //       // },
  //       {
  //         $match: {
  //           _id: mongoose.Types.ObjectId(package_id)
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "destination_categories",
  //           localField: "destination_category_id",
  //           foreignField: "_id",
  //           as: "destination_category_id"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "destinations",
  //           localField: "destination",
  //           foreignField: "_id",
  //           as: "destination"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "place_to_visits",
  //           localField: "place_to_visit_id",
  //           foreignField: "_id",
  //           as: "Place"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "itineries",
  //           localField: "_id",
  //           foreignField: "package_id",
  //           as: "Itinaries"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "hotel_itienraries",
  //           localField: "Itinaries.hotel_itienrary_id",
  //           foreignField: "_id",
  //           as: "hotel_itienrary"
  //         }
  //       },
  //       {
  //         $addFields: {
  //           hotel_itienrary: {
  //             $map: {
  //               input: "$hotel_itienrary",
  //               as: "hotel",
  //               in: {
  //                 $mergeObjects: [
  //                   "$$hotel",
  //                   {
  //                     days: {
  //                       $reduce: {
  //                         input: {
  //                           $map: {
  //                             input: {
  //                               $filter: {
  //                                 input: "$Itinaries",
  //                                 as: "itinerary",
  //                                 cond: {
  //                                   $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"]
  //                                 }
  //                               }
  //                             },
  //                             as: "itinerary",
  //                             in: {
  //                               $toString: "$$itinerary.day"
  //                             }
  //                           }
  //                         },
  //                         initialValue: "",
  //                         in: {
  //                           $cond: {
  //                             if: { $eq: ["$$value", ""] },
  //                             then: "$$this",
  //                             else: { $concat: ["$$value", ",", "$$this"] }
  //                           }
  //                         }
  //                       }
  //                     },
  //                     hotel_photo: {
  //                       $map: {
  //                         input: "$$hotel.hotel_photo",
  //                         as: "photo",
  //                         in: {
  //                           $concat: [baseHotelPhotoURL, "$$photo"]
  //                         }
  //                       }
  //                     }
  //                   }
  //                 ]
  //               }
  //             }
  //           }
  //         }
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           name: 1,
  //           user_id: 1,
  //           price_per_person: 1,
  //           price_and_date: 1,
  //           total_days: 1,
  //           total_nights: 1,
  //           destination: 1,
  //           destination_category_id: 1,
  //           // destination_category:1,
  //           meal_type: 1,
  //           place_to_visit_id: 1,
  //           meal_required: 1,
  //           travel_by: 1,
  //           hotel_type: 1,
  //           more_details: 1,
  //           include_service: 1,
  //           exclude_service: 1,
  //           sightseeing: 1,
  //           status: 1,
  //           start_date: 1,
  //           end_date: 1,
  //           Place: {
  //             photo: 1
  //           },
  //           Itinaries: 1,
  //           hotel_itienrary: 1,
  //           price_per_person_infant: 1,
  //           price_per_person_child: 1,
  //           price_per_person_adult: 1,
  //           room_sharing: 1,
  //           total_amount: 1,
  //           package_type: 1
  //           // package_valid_till_for_booking: 1

  //         }
  //       }
  //     ]);

  //     if (packageData.length === 0) {
  //       throw new Forbidden("package not exists");
  //     }

  //     for (let i = 0; i < packageData[0].include_service.length; i++) {
  //       packageData[0].include_service[i] = { include_services_value: packageData[0].include_service[i] };
  //     }
  //     for (let i = 0; i < packageData[0].exclude_service.length; i++) {
  //       packageData[0].exclude_service[i] = { exclude_services_value: packageData[0].exclude_service[i] };
  //     }
  //     // packageData[0].meal_required = packageData[0].meal_required[0];
  //     packageData[0].day = packageData[0].total_days + "D/" + packageData[0].total_nights + "N";
  //     packageData[0].Itinaries.forEach(async (element) => {
  //       element.photo = await image_url("itinary", element.photo);
  //     });
  //     packageData[0].Place[0].photo = await image_url("placephoto", packageData[0].Place[0].photo);
  //     // packageData[0].Place[0].photo = generateFileDownloadLinkPrefix(req.localHostURL) + packageData[0].Place[0].photo;
  //     const currentDate = new Date();
  //     let priceFound = false;

  //     if (packageData[0].price_and_date && packageData[0].price_and_date.length > 0) {
  //       for (let i = 0; i < packageData[0].price_and_date.length; i++) {
  //         const startDate = new Date(packageData[0].price_and_date[i].price_start_date);
  //         const endDate = new Date(packageData[0].price_and_date[i].price_end_date);

  //         if (currentDate >= startDate && currentDate <= endDate) {
  //           packageData[0].price_per_person = packageData[0].price_and_date[i].price_per_person;
  //           priceFound = true;
  //           break;
  //         }
  //       }

  //       if (!priceFound) {
  //         packageData[0].price_per_person = packageData[0].price_and_date[0].price_per_person;
  //       }
  //     } else {
  //       packageData[0].price_per_person = packageData[0].price_per_person
  //     }

  //     return this.sendJSONResponse(
  //       res,
  //       "package retrived",
  //       {
  //         length: 1
  //       },
  //       packageData
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  // async getPackageDetails(req, res) {
  //   try {

  //     const package_id = req.query.package_id;

  //     const baseHotelPhotoURL = "https://start-your-tour-api.onrender.com/images/hotel_itienrary/";

  //     // Find the package profit margin
  //     const packageProfitMargin = await package_profit_margin.find();

  //     const packageData = await PackageSchema.aggregate([
  //       // {
  //       //   $match: {
  //       //     $and: [{ _id: mongoose.Types.ObjectId(package_id) }, { status: true }]
  //       //   }
  //       // },
  //       {
  //         $match: {
  //           _id: mongoose.Types.ObjectId(package_id)
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "destination_categories",
  //           localField: "destination_category_id",
  //           foreignField: "_id",
  //           as: "destination_category_id"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "destinations",
  //           localField: "destination",
  //           foreignField: "_id",
  //           as: "destination"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "place_to_visits",
  //           localField: "place_to_visit_id",
  //           foreignField: "_id",
  //           as: "Place"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "itineries",
  //           localField: "_id",
  //           foreignField: "package_id",
  //           as: "Itinaries"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "hotel_itienraries",
  //           localField: "Itinaries.hotel_itienrary_id",
  //           foreignField: "_id",
  //           as: "hotel_itienrary"
  //         }
  //       },
  //       {
  //         $addFields: {
  //           hotel_itienrary: {
  //             $map: {
  //               input: "$hotel_itienrary",
  //               as: "hotel",
  //               in: {
  //                 $mergeObjects: [
  //                   "$$hotel",
  //                   {
  //                     days: {
  //                       $reduce: {
  //                         input: {
  //                           $map: {
  //                             input: {
  //                               $filter: {
  //                                 input: "$Itinaries",
  //                                 as: "itinerary",
  //                                 cond: {
  //                                   $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"]
  //                                 }
  //                               }
  //                             },
  //                             as: "itinerary",
  //                             in: {
  //                               $toString: "$$itinerary.day"
  //                             }
  //                           }
  //                         },
  //                         initialValue: "",
  //                         in: {
  //                           $cond: {
  //                             if: { $eq: ["$$value", ""] },
  //                             then: "$$this",
  //                             else: { $concat: ["$$value", ",", "$$this"] }
  //                           }
  //                         }
  //                       }
  //                     },
  //                     hotel_photo: {
  //                       $map: {
  //                         input: "$$hotel.hotel_photo",
  //                         as: "photo",
  //                         in: {
  //                           $concat: [baseHotelPhotoURL, "$$photo"]
  //                         }
  //                       }
  //                     }
  //                   }
  //                 ]
  //               }
  //             }
  //           }
  //         }
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           name: 1,
  //           user_id: 1,
  //           price_per_person: 1,
  //           price_and_date: 1,
  //           total_days: 1,
  //           total_nights: 1,
  //           destination: 1,
  //           destination_category_id: 1,
  //           // destination_category:1,
  //           meal_type: 1,
  //           place_to_visit_id: 1,
  //           meal_required: 1,
  //           travel_by: 1,
  //           hotel_type: 1,
  //           more_details: 1,
  //           include_service: 1,
  //           exclude_service: 1,
  //           sightseeing: 1,
  //           status: 1,
  //           start_date: 1,
  //           end_date: 1,
  //           Place: {
  //             photo: 1
  //           },
  //           Itinaries: 1,
  //           hotel_itienrary: 1,
  //           price_per_person_infant: 1,
  //           price_per_person_child: 1,
  //           price_per_person_adult: 1,
  //           room_sharing: 1,
  //           total_amount: 1,
  //           package_type: 1
  //           // package_valid_till_for_booking: 1

  //         }
  //       }
  //     ]);

  //     if (packageData.length === 0) {
  //       throw new Forbidden("package not exists");
  //     }

  //     const startDate = new Date(packageData[0].start_date);
  //     const endDate = new Date(packageData[0].end_date);
  //     // const pricePerPerson = packageData[0].price_per_person;
  //     // let totalFinalPricePerPerson = 0;

  //     function getMonthsBetween(startDate, endDate) {
  //       const months = [];
  //       const current = new Date(startDate);
  //       while (current <= endDate) {
  //         const month = current.toLocaleString("default", { month: "long" });
  //         months.push(month);
  //         current.setMonth(current.getMonth() + 1);
  //       }
  //       return months;
  //     }

  //     // Format include_service and exclude_service
  //     packageData[0].include_service = packageData[0].include_service.map(service => ({ include_services_value: service }));
  //     packageData[0].exclude_service = packageData[0].exclude_service.map(service => ({ exclude_services_value: service }));

  //     // Process Itinaries photos
  //     packageData[0].Itinaries.forEach(async (element) => {
  //       element.photo = await image_url("itinary", element.photo);
  //     });
  //     packageData[0].Place[0].photo = await image_url("placephoto", packageData[0].Place[0].photo);

  //     // Handle price and date
  //     const currentDate = new Date();
  //     let priceFound = false;

  //     if (packageData[0].price_and_date && packageData[0].price_and_date.length > 0) {
  //       for (let i = 0; i < packageData[0].price_and_date.length; i++) {
  //         const priceStartDate = new Date(packageData[0].price_and_date[i].price_start_date);
  //         const priceEndDate = new Date(packageData[0].price_and_date[i].price_end_date);

  //         if (currentDate >= priceStartDate && currentDate <= priceEndDate) {
  //           const vender_price_per_person = packageData[0].price_and_date[i].price_per_person;
  //           // const vender_price_per_person = packageData[0].price_per_person
  //           packageData[0].vender_price_per_person = vender_price_per_person;
  //           console.log("abc", vender_price_per_person)
  //           priceFound = true;
  //           break;
  //         }
  //       }

  //       if (!priceFound) {
  //         packageData[0].vender_price_per_person = packageData[0].price_and_date[0].price_per_person;
  //       }
  //     }

  //     const monthsBetween = getMonthsBetween(startDate, endDate);

  //     const filteredProfitMargin = packageProfitMargin.map((state) => {
  //       // Find the matching destination from the package data
  //       const matchingDestination = packageData[0].destination.find(
  //         dest => dest.destination_name === state.state_name
  //       );

  //       // If a destination matches, proceed with margin calculation
  //       if (matchingDestination) {
  //         // Filter the margins for months that match the range in the package data
  //         const marginData = state.month_and_margin_agency.filter((monthData) =>
  //           monthsBetween.includes(monthData.month_name)
  //         );

  //         if (marginData.length > 0) {
  //           // Calculate the final price for each margin in the marginData array
  //           const monthAndMarginWithFinalPrice = marginData.map((monthData) => {
  //             const marginPercentage = monthData.margin_percentage / 100;
  //             const marginPercentagePrice = packageData[0].vender_price_per_person * marginPercentage;
  //             const finalPrice = packageData[0].vender_price_per_person + (packageData[0].vender_price_per_person * marginPercentage);

  //             // totalFinalPricePerPerson += finalPrice;

  //             return {
  //               month_name: monthData.month_name,
  //               margin_percentage: monthData.margin_percentage,
  //               marginPercentagePrice: marginPercentagePrice,
  //               final_price: finalPrice // Include final price for each month
  //             };
  //           });

  //           // Return the state and the modified margin data
  //           return {
  //             state_name: state.state_name,
  //             month_and_margin_agency: monthAndMarginWithFinalPrice // Include final prices with margin
  //           };
  //         }
  //       }
  //     }).filter(state => state !== undefined);

  //     // Include filtered packageProfitMargin in the final response
  //     packageData[0].agencyProfitMargin = filteredProfitMargin;
  //     // packageData[0].totalFinalPricePerPerson = totalFinalPricePerPerson;

  //     return this.sendJSONResponse(
  //       res,
  //       "package retrieved",
  //       { length: 1 },
  //       packageData
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error);
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  // async getPackageDetails(req, res) {
  //   try {
  //     const package_id = req.query.package_id;
  //     const baseHotelPhotoURL = "https://start-your-tour-api.onrender.com/images/hotel_itienrary/";
  //     const packageProfitMargin = await package_profit_margin.find();

  //     const packageData = await PackageSchema.aggregate([
  //       { $match: { _id: mongoose.Types.ObjectId(package_id) } },
  //       {
  //         $lookup: {
  //           from: "destination_categories",
  //           localField: "destination_category_id",
  //           foreignField: "_id",
  //           as: "destination_category_id"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "destinations",
  //           localField: "destination",
  //           foreignField: "_id",
  //           as: "destination"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "place_to_visits",
  //           localField: "place_to_visit_id",
  //           foreignField: "_id",
  //           as: "Place"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "itineries",
  //           localField: "_id",
  //           foreignField: "package_id",
  //           as: "Itinaries",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "hotel_itienraries",
  //                 localField: "hotel_itienrary_id",
  //                 foreignField: "_id",
  //                 as: "hotel_itienrary",
  //                 pipeline: [
  //                   {
  //                     $project: {
  //                       _id: 0, // Exclude the _id field
  //                       hotel_name: 1,
  //                       rooms: 1,
  //                       hotel_address: 1,
  //                       hotel_type: 1,
  //                       hotel_city: 1,
  //                       hotel_state: 1,
  //                       hotel_description: 1,
  //                       other: 1,
  //                       lunch_price: 1,
  //                       dinner_price: 1,
  //                       breakfast_price: 1
  //                       // breakfast: 1,
  //                       // lunch: 1,
  //                       // dinner: 1
  //                     }
  //                   }
  //                 ]
  //               }
  //             },
  //             {
  //               $addFields: {
  //                 hotel_name: { $arrayElemAt: ["$hotel_itienrary.hotel_name", 0] },
  //                 rooms: { $arrayElemAt: ["$hotel_itienrary.rooms", 0] },
  //                 hotel_address: { $arrayElemAt: ["$hotel_itienrary.hotel_address", 0] },
  //                 hotel_type: { $arrayElemAt: ["$hotel_itienrary.hotel_type", 0] },
  //                 hotel_city: { $arrayElemAt: ["$hotel_itienrary.hotel_city", 0] },
  //                 hotel_state: { $arrayElemAt: ["$hotel_itienrary.hotel_state", 0] },
  //                 hotel_description: { $arrayElemAt: ["$hotel_itienrary.hotel_description", 0] },
  //                 other: { $arrayElemAt: ["$hotel_itienrary.other", 0] },
  //                 lunch_price: { $arrayElemAt: ["$hotel_itienrary.lunch_price", 0] },
  //                 dinner_price: { $arrayElemAt: ["$hotel_itienrary.dinner_price", 0] },
  //                 breakfast_price: { $arrayElemAt: ["$hotel_itienrary.breakfast_price", 0] }
  //                 // lunch: { $arrayElemAt: ["$hotel_itienrary.lunch", 0] },
  //                 // dinner: { $arrayElemAt: ["$hotel_itienrary.dinner", 0] },
  //                 // breakfast: { $arrayElemAt: ["$hotel_itienrary.breakfast", 0] }
  //               }
  //             },
  //             {
  //               $project: {
  //                 hotel_itienrary: 0
  //               }
  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "hotel_itienraries",
  //           localField: "Itinaries.hotel_itienrary_id",
  //           foreignField: "_id",
  //           as: "hotel_itienrary"
  //         }
  //       },
  //       {
  //         $set: {
  //           Itinaries: {
  //             $map: {
  //               input: "$Itinaries",
  //               as: "itinerary",
  //               in: {
  //                 $mergeObjects: [
  //                   "$$itinerary",
  //                   {
  //                     selected_rooms: {
  //                       $filter: {
  //                         input: "$$itinerary.rooms",
  //                         as: "room",
  //                         cond: { $eq: ["$$room._id", "$$itinerary.room_id"] }
  //                       }
  //                     }
  //                   }
  //                 ]
  //               }
  //             }
  //           }
  //         }
  //       },
  //       {
  //         $set: {
  //           hotel_itienrary: {
  //             $map: {
  //               input: "$hotel_itienrary",
  //               as: "hotel",
  //               in: {
  //                 $mergeObjects: [
  //                   "$$hotel",
  //                   {
  //                     days: {
  //                       $reduce: {
  //                         input: {
  //                           $map: {
  //                             input: {
  //                               $filter: {
  //                                 input: "$Itinaries",
  //                                 as: "itinerary",
  //                                 cond: {
  //                                   $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"]
  //                                 }
  //                               }
  //                             },
  //                             as: "itinerary",
  //                             in: { $toString: "$$itinerary.day" }
  //                           }
  //                         },
  //                         initialValue: "",
  //                         in: {
  //                           $cond: {
  //                             if: { $eq: ["$$value", ""] },
  //                             then: "$$this",
  //                             else: { $concat: ["$$value", ",", "$$this"] }
  //                           }
  //                         }
  //                       }
  //                     },
  //                     hotel_photo: {
  //                       $map: {
  //                         input: "$$hotel.hotel_photo",
  //                         as: "photo",
  //                         in: { $concat: [baseHotelPhotoURL, "$$photo"] }
  //                       }
  //                     },
  //                     selected_rooms: {
  //                       $reduce: {
  //                         input: {
  //                           $map: {
  //                             input: {
  //                               $filter: {
  //                                 input: "$Itinaries",
  //                                 as: "itinerary",
  //                                 cond: {
  //                                   $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"]
  //                                 }
  //                               }
  //                             },
  //                             as: "itinerary",
  //                             in: {
  //                               selected_rooms: {
  //                                 $filter: {
  //                                   input: "$$hotel.rooms",
  //                                   as: "room",
  //                                   cond: {
  //                                     $eq: ["$$room._id", "$$itinerary.room_id"]
  //                                   }
  //                                 }
  //                               }
  //                             }
  //                           }
  //                         },
  //                         initialValue: [],
  //                         in: {
  //                           $setUnion: ["$$value", "$$this.selected_rooms"]
  //                         }
  //                       }
  //                     },
  //                     // Add breakfast, lunch, dinner here
  //                     itinerary_breakfast: {
  //                       $anyElementTrue: {
  //                         $map: {
  //                           input: {
  //                             $filter: {
  //                               input: "$Itinaries",
  //                               as: "itinerary",
  //                               cond: { $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"] }
  //                             }
  //                           },
  //                           as: "itinerary",
  //                           in: "$$itinerary.breakfast"
  //                         }
  //                       }
  //                     },
  //                     itinerary_lunch: {
  //                       $anyElementTrue: {
  //                         $map: {
  //                           input: {
  //                             $filter: {
  //                               input: "$Itinaries",
  //                               as: "itinerary",
  //                               cond: { $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"] }
  //                             }
  //                           },
  //                           as: "itinerary",
  //                           in: "$$itinerary.lunch"
  //                         }
  //                       }
  //                     },
  //                     itinerary_dinner: {
  //                       $anyElementTrue: {
  //                         $map: {
  //                           input: {
  //                             $filter: {
  //                               input: "$Itinaries",
  //                               as: "itinerary",
  //                               cond: { $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"] }
  //                             }
  //                           },
  //                           as: "itinerary",
  //                           in: "$$itinerary.dinner"
  //                         }
  //                       }
  //                     }
  //                   }
  //                 ]
  //               }
  //             }
  //           }
  //         }
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           name: 1,
  //           user_id: 1,
  //           price_per_person: 1,
  //           price_and_date: 1,
  //           total_days: 1,
  //           total_nights: 1,
  //           destination: 1,
  //           destination_category_id: 1,
  //           meal_type: 1,
  //           place_to_visit_id: 1,
  //           meal_required: 1,
  //           travel_by: 1,
  //           hotel_type: 1,
  //           more_details: 1,
  //           include_service: 1,
  //           exclude_service: 1,
  //           sightseeing: 1,
  //           status: 1,
  //           start_date: 1,
  //           end_date: 1,
  //           Place: { photo: 1 },
  //           Itinaries: 1,
  //           hotel_itienrary: 1,
  //           room_sharing: 1,
  //           package_type: 1,
  //           breakfast_price: 1,
  //           lunch_price: 1,
  //           dinner_price: 1,
  //           breakfast: 1,
  //           lunch: 1,
  //           dinner: 1
  //         }
  //       }
  //     ]);

  //     const packageReviews = await ReviewSchema.aggregate([
  //       {
  //         $addFields: {
  //           star_numeric: { $toInt: "$star" } // Convert `star` from string to number
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "book_packages",
  //           localField: "book_package_id",
  //           foreignField: "_id",
  //           as: "booked_package"
  //         }
  //       },
  //       {
  //         $unwind: {
  //           path: "$booked_package",
  //           preserveNullAndEmptyArrays: true
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "packages",
  //           localField: "booked_package.package_id",
  //           foreignField: "_id",
  //           as: "package_info"
  //         }
  //       },
  //       {
  //         $unwind: {
  //           path: "$packageInfo",
  //           preserveNullAndEmptyArrays: true
  //         }
  //       },
  //       // {
  //       //   $match: {
  //       //     "packageInfo._id": { $ne: null }
  //       //   }
  //       // },
  //       {
  //         $group: {
  //           _id: "$package_info.destination", // Group by destination_id
  //           package_id: { $first: "$package_info._id" }, // Group by destination_id
  //           total_reviews: { $sum: 1 }, // Total number of reviews
  //           total_rating: { $sum: "$star_numeric" } // Sum of all ratings
  //         }
  //       },
  //       {
  //         $project: {
  //           destination_id: "$_id",
  //           package_id: "$package_id",
  //           total_reviews: 1,
  //           avg_rating: {
  //             $cond: {
  //               if: { $gt: ["$total_reviews", 0] },
  //               then: { $divide: ["$total_rating", "$total_reviews"] },
  //               else: 0
  //             }
  //           }
  //         }
  //       }
  //     ]);

  //     console.log("packageReviews", packageReviews);

  //     const reviewMap = {};
  //     packageReviews.forEach((review) => {
  //       const key = review.package_id?.toString(); // ✅ Prevent null crash
  //       if (key) {
  //         reviewMap[key] = review;
  //       }
  //     });

  //     // 3️⃣ Inject avg_rating into DestinationData
  //     packageData.forEach((destination) => {
  //       const reviewData = reviewMap[destination._id.toString()] || { avg_rating: 0, total_reviews: 0 };
  //       destination.avg_rating = Number(reviewData.avg_rating.toFixed(1));
  //       destination.total_reviews = reviewData.total_reviews;
  //     });

  //     if (packageData.length === 0) {
  //       throw new Forbidden("package not exists");
  //     }

  //     // Format include_service and exclude_service
  //     packageData[0].include_service = packageData[0].include_service.map((service) => ({
  //       include_services_value: service
  //     }));
  //     packageData[0].exclude_service = packageData[0].exclude_service.map((service) => ({
  //       exclude_services_value: service
  //     }));

  //     // Process Itinaries photos
  //     packageData[0].Itinaries.forEach(async (element) => {
  //       element.photo = await image_url("itinary", element.photo);
  //     });
  //     packageData[0].Place[0].photo = await image_url("placephoto", packageData[0].Place[0].photo);

  //     // Handle price and date
  //     const currentDate = new Date();
  //     let priceFound = false;

  //     if (packageData[0].price_and_date && packageData[0].price_and_date.length > 0) {
  //       for (let i = 0; i < packageData[0].price_and_date.length; i++) {
  //         const priceStartDate = new Date(packageData[0].price_and_date[i].price_start_date);
  //         const priceEndDate = new Date(packageData[0].price_and_date[i].price_end_date);

  //         if (currentDate >= priceStartDate && currentDate <= priceEndDate) {
  //           const vender_price_per_person = packageData[0].price_and_date[i].price_per_person;
  //           packageData[0].vender_price_per_person = vender_price_per_person;

  //           // Extract the month name from the start date
  //           const startMonthName = priceStartDate.toLocaleString("default", { month: "long" });

  //           // Find the profit margin for the extracted month
  //           const matchedProfitMargin = packageProfitMargin.find(
  //             (state) => state.state_name === packageData[0].destination[0].destination_name
  //           );

  //           if (matchedProfitMargin) {
  //             const monthMargin = matchedProfitMargin.month_and_margin_user.find(
  //               (margin) => margin.month_name === startMonthName
  //             );

  //             if (monthMargin) {
  //               const adminMarginPercentage = parseFloat(monthMargin.margin_percentage);
  //               const adminMarginDecimal = adminMarginPercentage / 100;

  //               // Calculate the final price per person with admin margin
  //               packageData[0].vender_price_per_person = Math.round(vender_price_per_person * (1 + adminMarginDecimal));
  //             }
  //           }

  //           priceFound = true;
  //           break;
  //         }
  //       }

  //       if (!priceFound) {
  //         packageData[0].vender_price_per_person = packageData[0].price_and_date[0].price_per_person;

  //         // Extract the month name from the first price start date
  //         const startMonthName = new Date(packageData[0].price_and_date[0].price_start_date).toLocaleString("default", {
  //           month: "long"
  //         });

  //         // Find the profit margin for the extracted month
  //         const matchedProfitMargin = packageProfitMargin.find(
  //           (state) => state.state_name === packageData[0].destination[0].destination_name
  //         );

  //         if (matchedProfitMargin) {
  //           const monthMargin = matchedProfitMargin.month_and_margin_user.find(
  //             (margin) => margin.month_name === startMonthName
  //           );

  //           if (monthMargin) {
  //             const adminMarginPercentage = parseFloat(monthMargin.margin_percentage);
  //             const adminMarginDecimal = adminMarginPercentage / 100;

  //             // Calculate the final price per person with admin margin
  //             packageData[0].vender_price_per_person = Math.round(
  //               packageData[0].vender_price_per_person * (1 + adminMarginDecimal)
  //             );
  //           }
  //         }
  //       }
  //     }

  //     const defaultMonths = [
  //       "January",
  //       "February",
  //       "March",
  //       "April",
  //       "May",
  //       "June",
  //       "July",
  //       "August",
  //       "September",
  //       "October",
  //       "November",
  //       "December"
  //     ];

  //     // Extract destination_name from the package data
  //     const destinationName = packageData[0].destination[0].destination_name;

  //     console.log(destinationName);

  //     // Find if this destination exists in the profit margin data
  //     const matchedProfitMargin = packageProfitMargin.find((state) => state.state_name === destinationName);

  //     // If a match is found, use the matched profit margin
  //     if (matchedProfitMargin) {
  //       packageData[0].profitMargin = [
  //         {
  //           state_name: matchedProfitMargin.state_name,
  //           month_and_margin_user: matchedProfitMargin.month_and_margin_user
  //         }
  //       ];
  //     } else {
  //       // If no match is found, create a new profit margin with admin_margin 0 for all months
  //       packageData[0].profitMargin = [
  //         {
  //           state_name: destinationName,
  //           month_and_margin_user: defaultMonths.map((month) => ({
  //             month_name: month,
  //             margin_percentage: "10"
  //           }))
  //         }
  //       ];
  //     }

  //     return this.sendJSONResponse(res, "package retrieved", { length: 1 }, packageData);
  //   } catch (error) {
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

   async getPackageDetails(req, res) {
    try {
      const package_id = req.query.package_id;
      const baseHotelPhotoURL = "https://start-your-tour-api.onrender.com/images/hotel_itienrary/";
      const packageProfitMargin = await package_profit_margin.find();

      const packageData = await PackageSchema.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(package_id) } },
        {
          $lookup: {
            from: "destination_categories",
            localField: "destination_category_id",
            foreignField: "_id",
            as: "destination_category_id"
          }
        },
        {
          $lookup: {
            from: "destinations",
            localField: "destination",
            foreignField: "_id",
            as: "destination"
          }
        },
        {
          $lookup: {
            from: "place_to_visits",
            localField: "place_to_visit_id",
            foreignField: "_id",
            as: "Place"
          }
        },
        {
          $lookup: {
            from: "place_to_visits",
            localField: "destination._id",
            foreignField: "destination_id",
            as: "place_to_visit_photos",
            pipeline: [
              {
                $project: {
                  _id:0,
                  photo: 1
                }
              },
              {
                $limit:5
              }
            ]
          }
        },
        {
          $lookup: {
            from: "itineries",
            localField: "_id",
            foreignField: "package_id",
            as: "Itinaries",
            pipeline: [
              {
                $lookup: {
                  from: "hotel_itienraries",
                  localField: "hotel_itienrary_id",
                  foreignField: "_id",
                  as: "hotel_itienrary",
                  pipeline: [
                    {
                      $project: {
                        _id: 0, // Exclude the _id field
                        hotel_name: 1,
                        rooms: 1,
                        hotel_address: 1,
                        hotel_type: 1,
                        hotel_city: 1,
                        hotel_state: 1,
                        hotel_description: 1,
                        other: 1,
                        lunch_price: 1,
                        dinner_price: 1,
                        breakfast_price: 1
                        // breakfast: 1,
                        // lunch: 1,
                        // dinner: 1
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  hotel_name: { $arrayElemAt: ["$hotel_itienrary.hotel_name", 0] },
                  rooms: { $arrayElemAt: ["$hotel_itienrary.rooms", 0] },
                  hotel_address: { $arrayElemAt: ["$hotel_itienrary.hotel_address", 0] },
                  hotel_type: { $arrayElemAt: ["$hotel_itienrary.hotel_type", 0] },
                  hotel_city: { $arrayElemAt: ["$hotel_itienrary.hotel_city", 0] },
                  hotel_state: { $arrayElemAt: ["$hotel_itienrary.hotel_state", 0] },
                  hotel_description: { $arrayElemAt: ["$hotel_itienrary.hotel_description", 0] },
                  other: { $arrayElemAt: ["$hotel_itienrary.other", 0] },
                  lunch_price: { $arrayElemAt: ["$hotel_itienrary.lunch_price", 0] },
                  dinner_price: { $arrayElemAt: ["$hotel_itienrary.dinner_price", 0] },
                  breakfast_price: { $arrayElemAt: ["$hotel_itienrary.breakfast_price", 0] }
                  // lunch: { $arrayElemAt: ["$hotel_itienrary.lunch", 0] },
                  // dinner: { $arrayElemAt: ["$hotel_itienrary.dinner", 0] },
                  // breakfast: { $arrayElemAt: ["$hotel_itienrary.breakfast", 0] }
                }
              },
              {
                $project: {
                  hotel_itienrary: 0
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "hotel_itienraries",
            localField: "Itinaries.hotel_itienrary_id",
            foreignField: "_id",
            as: "hotel_itienrary"
          }
        },
        {
          $set: {
            Itinaries: {
              $map: {
                input: "$Itinaries",
                as: "itinerary",
                in: {
                  $mergeObjects: [
                    "$$itinerary",
                    {
                      selected_rooms: {
                        $filter: {
                          input: "$$itinerary.rooms",
                          as: "room",
                          cond: { $eq: ["$$room._id", "$$itinerary.room_id"] }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $set: {
            hotel_itienrary: {
              $map: {
                input: "$hotel_itienrary",
                as: "hotel",
                in: {
                  $mergeObjects: [
                    "$$hotel",
                    {
                      days: {
                        $reduce: {
                          input: {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$Itinaries",
                                  as: "itinerary",
                                  cond: {
                                    $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"]
                                  }
                                }
                              },
                              as: "itinerary",
                              in: { $toString: "$$itinerary.day" }
                            }
                          },
                          initialValue: "",
                          in: {
                            $cond: {
                              if: { $eq: ["$$value", ""] },
                              then: "$$this",
                              else: { $concat: ["$$value", ",", "$$this"] }
                            }
                          }
                        }
                      },
                      hotel_photo: {
                        $map: {
                          input: "$$hotel.hotel_photo",
                          as: "photo",
                          in: { $concat: [baseHotelPhotoURL, "$$photo"] }
                        }
                      },
                      selected_rooms: {
                        $reduce: {
                          input: {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$Itinaries",
                                  as: "itinerary",
                                  cond: {
                                    $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"]
                                  }
                                }
                              },
                              as: "itinerary",
                              in: {
                                selected_rooms: {
                                  $filter: {
                                    input: "$$hotel.rooms",
                                    as: "room",
                                    cond: {
                                      $eq: ["$$room._id", "$$itinerary.room_id"]
                                    }
                                  }
                                }
                              }
                            }
                          },
                          initialValue: [],
                          in: {
                            $setUnion: ["$$value", "$$this.selected_rooms"]
                          }
                        }
                      },
                      // Add breakfast, lunch, dinner here
                      itinerary_breakfast: {
                        $anyElementTrue: {
                          $map: {
                            input: {
                              $filter: {
                                input: "$Itinaries",
                                as: "itinerary",
                                cond: { $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"] }
                              }
                            },
                            as: "itinerary",
                            in: "$$itinerary.breakfast"
                          }
                        }
                      },
                      itinerary_lunch: {
                        $anyElementTrue: {
                          $map: {
                            input: {
                              $filter: {
                                input: "$Itinaries",
                                as: "itinerary",
                                cond: { $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"] }
                              }
                            },
                            as: "itinerary",
                            in: "$$itinerary.lunch"
                          }
                        }
                      },
                      itinerary_dinner: {
                        $anyElementTrue: {
                          $map: {
                            input: {
                              $filter: {
                                input: "$Itinaries",
                                as: "itinerary",
                                cond: { $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"] }
                              }
                            },
                            as: "itinerary",
                            in: "$$itinerary.dinner"
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            user_id: 1,
            price_per_person: 1,
            price_and_date: 1,
            total_days: 1,
            total_nights: 1,
            destination: 1,
            destination_category_id: 1,
            meal_type: 1,
            place_to_visit_id: 1,
            meal_required: 1,
            travel_by: 1,
            hotel_type: 1,
            more_details: 1,
            include_service: 1,
            exclude_service: 1,
            sightseeing: 1,
            status: 1,
            start_date: 1,
            end_date: 1,
            Place: { photo: 1 },
            Itinaries: 1,
            hotel_itienrary: 1,
            room_sharing: 1,
            package_type: 1,
            breakfast_price: 1,
            lunch_price: 1,
            dinner_price: 1,
            breakfast: 1,
            lunch: 1,
            dinner: 1,
            place_to_visit_photos: 1
          }
        }
      ]);

      const packageReviews = await ReviewSchema.aggregate([
        {
          $addFields: {
            star_numeric: { $toInt: "$star" } // Convert `star` from string to number
          }
        },
        {
          $lookup: {
            from: "book_packages",
            localField: "book_package_id",
            foreignField: "_id",
            as: "booked_package"
          }
        },
        {
          $unwind: {
            path: "$booked_package",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "packages",
            localField: "booked_package.package_id",
            foreignField: "_id",
            as: "package_info"
          }
        },
        {
          $unwind: {
            path: "$packageInfo",
            preserveNullAndEmptyArrays: true
          }
        },
        // {
        //   $match: {
        //     "packageInfo._id": { $ne: null }
        //   }
        // },
        {
          $group: {
            _id: "$package_info.destination", // Group by destination_id
            package_id: { $first: "$package_info._id" }, // Group by destination_id
            total_reviews: { $sum: 1 }, // Total number of reviews
            total_rating: { $sum: "$star_numeric" } // Sum of all ratings
          }
        },
        {
          $project: {
            destination_id: "$_id",
            package_id: "$package_id",
            total_reviews: 1,
            avg_rating: {
              $cond: {
                if: { $gt: ["$total_reviews", 0] },
                then: { $divide: ["$total_rating", "$total_reviews"] },
                else: 0
              }
            }
          }
        }
      ]);

      console.log("packageReviews", packageReviews);

      const reviewMap = {};
      packageReviews.forEach((review) => {
        const key = review.package_id?.toString(); // ✅ Prevent null crash
        if (key) {
          reviewMap[key] = review;
        }
      });

      // 3️⃣ Inject avg_rating into DestinationData
      packageData.forEach((destination) => {
        const reviewData = reviewMap[destination._id.toString()] || { avg_rating: 0, total_reviews: 0 };
        destination.avg_rating = Number(reviewData.avg_rating.toFixed(1));
        destination.total_reviews = reviewData.total_reviews;
      });

      if (packageData.length === 0) {
        throw new Forbidden("package not exists");
      }

      // Format include_service and exclude_service
      packageData[0].include_service = packageData[0].include_service.map((service) => ({
        include_services_value: service
      }));
      packageData[0].exclude_service = packageData[0].exclude_service.map((service) => ({
        exclude_services_value: service
      }));

      // Process Itinaries photos
      packageData[0].Itinaries.forEach(async (element) => {
        element.photo = await image_url("itinary", element.photo);
      });

      packageData[0].place_to_visit_photos.forEach(async (element) => {
        element.photo = await image_url("placephoto", element.photo);
      });

      
      packageData[0].Place[0].photo = await image_url("placephoto", packageData[0].Place[0].photo);

      // Handle price and date
      const currentDate = new Date();
      let priceFound = false;

      if (packageData[0].price_and_date && packageData[0].price_and_date.length > 0) {
        for (let i = 0; i < packageData[0].price_and_date.length; i++) {
          const priceStartDate = new Date(packageData[0].price_and_date[i].price_start_date);
          const priceEndDate = new Date(packageData[0].price_and_date[i].price_end_date);

          if (currentDate >= priceStartDate && currentDate <= priceEndDate) {
            const vender_price_per_person = packageData[0].price_and_date[i].price_per_person;
            packageData[0].vender_price_per_person = vender_price_per_person;

            // Extract the month name from the start date
            const startMonthName = priceStartDate.toLocaleString("default", { month: "long" });

            // Find the profit margin for the extracted month
            const matchedProfitMargin = packageProfitMargin.find(
              (state) => state.state_name === packageData[0].destination[0].destination_name
            );

            if (matchedProfitMargin) {
              const monthMargin = matchedProfitMargin.month_and_margin_user.find(
                (margin) => margin.month_name === startMonthName
              );

              if (monthMargin) {
                const adminMarginPercentage = parseFloat(monthMargin.margin_percentage);
                const adminMarginDecimal = adminMarginPercentage / 100;

                // Calculate the final price per person with admin margin
                packageData[0].vender_price_per_person = Math.round(vender_price_per_person * (1 + adminMarginDecimal));
              }
            }

            priceFound = true;
            break;
          }
        }

        if (!priceFound) {
          packageData[0].vender_price_per_person = packageData[0].price_and_date[0].price_per_person;

          // Extract the month name from the first price start date
          const startMonthName = new Date(packageData[0].price_and_date[0].price_start_date).toLocaleString("default", {
            month: "long"
          });

          // Find the profit margin for the extracted month
          const matchedProfitMargin = packageProfitMargin.find(
            (state) => state.state_name === packageData[0].destination[0].destination_name
          );

          if (matchedProfitMargin) {
            const monthMargin = matchedProfitMargin.month_and_margin_user.find(
              (margin) => margin.month_name === startMonthName
            );

            if (monthMargin) {
              const adminMarginPercentage = parseFloat(monthMargin.margin_percentage);
              const adminMarginDecimal = adminMarginPercentage / 100;

              // Calculate the final price per person with admin margin
              packageData[0].vender_price_per_person = Math.round(
                packageData[0].vender_price_per_person * (1 + adminMarginDecimal)
              );
            }
          }
        }
      }

      const defaultMonths = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];

      // Extract destination_name from the package data
      const destinationName = packageData[0].destination[0].destination_name;

      console.log(destinationName);

      // Find if this destination exists in the profit margin data
      const matchedProfitMargin = packageProfitMargin.find((state) => state.state_name === destinationName);

      // If a match is found, use the matched profit margin
      if (matchedProfitMargin) {
        packageData[0].profitMargin = [
          {
            state_name: matchedProfitMargin.state_name,
            month_and_margin_user: matchedProfitMargin.month_and_margin_user
          }
        ];
      } else {
        // If no match is found, create a new profit margin with admin_margin 0 for all months
        packageData[0].profitMargin = [
          {
            state_name: destinationName,
            month_and_margin_user: defaultMonths.map((month) => ({
              month_name: month,
              margin_percentage: "10"
            }))
          }
        ];
      }

      return this.sendJSONResponse(res, "package retrieved", { length: 1 }, packageData);
    } catch (error) {
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async ShowPackageDetail(req, res) {
  //   try {
  //     const filter = req.query.filter || "all"; // Get filter from query params, default to "all"

  //     const matchCondition = {};
  //     if (filter === "agency") {
  //       matchCondition["agency_details.role"] = "agency";
  //     } else if (filter === "admin") {
  //       matchCondition["admin_details.role"] = "admin";
  //     }

  //     const Packagedetail = await PackageSchema.aggregate([
  //       {
  //         $lookup: {
  //           from: "users",
  //           localField: "user_id",
  //           foreignField: "_id",
  //           as: "agency_details",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "agencypersonals",
  //                 localField: "_id",
  //                 foreignField: "user_id",
  //                 as: "agency_personal_details"
  //               }
  //             },
  //             {
  //               $project: {
  //                 "_id": 1,
  //                 "role": 1,
  //                 "agency_personal_details.agency_name": 1
  //               }
  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "users",
  //           localField: "user_id",
  //           foreignField: "_id",
  //           as: "admin_details"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "destinations",
  //           localField: "destination",
  //           foreignField: "_id",
  //           as: "destination",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "place_to_visits",
  //                 localField: "_id",
  //                 foreignField: "destination_id",
  //                 as: "place_to_visits"
  //               }
  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $addFields: {
  //           photo: {
  //             $first: { $first: "$destination.place_to_visits.photo" }
  //           },
  //           destination_name: "$destination.destination_name"
  //         }
  //       },
  //       {
  //         $match: matchCondition // Apply the filter condition
  //       },
  //       {
  //         $project: {
  //           "_id": 1,
  //           "name": 1,
  //           "user_id": 1,
  //           "price_per_person": 1,
  //           "price_and_date": 1,
  //           "total_days": 1,
  //           "total_nights": 1,
  //           "destination_id": 1,
  //           "destination_name": 1,
  //           "destination_category_id": 1,
  //           "meal_required": 1,
  //           "meal_type": 1,
  //           "travel_by": 1,
  //           "hotel_type": 1,
  //           "more_details": 1,
  //           "place_to_visit_id": 1,
  //           "include_service": 1,
  //           "exclude_service": 1,
  //           "status": 1,
  //           "start_date": 1,
  //           "end_date": 1,
  //           "sightseeing": 1,
  //           "photo": 1,
  //           "agency_details": 1,
  //           "room_sharing": 1,
  //           "admin_details._id": 1,
  //           "admin_details.role": 1,
  //           "package_type": 1,
  //           "breakfast_price": 1,
  //           "lunch_price": 1,
  //           "dinner_price": 1,
  //           "breakfast": 1,
  //           "lunch": 1,
  //           "dinner": 1
  //         }
  //       }
  //     ]);

  //     const packageProfitMargin = await package_profit_margin.find();
  //     const currentDate = new Date();

  //     for (let i = 0; i < Packagedetail.length; i++) {
  //       Packagedetail[i].photo = await image_url("placephoto", Packagedetail[i].photo);

  //       let priceFound = false;
  //       let adminMarginPercentage = 10; // Default margin
  //       let selectedMonth = null;

  //       if (Packagedetail[i].price_and_date && Packagedetail[i].price_and_date.length > 0) {
  //         for (let j = 0; j < Packagedetail[i].price_and_date.length; j++) {
  //           const startDate = new Date(Packagedetail[i].price_and_date[j].price_start_date);
  //           const endDate = new Date(Packagedetail[i].price_and_date[j].price_end_date);

  //           if (currentDate >= startDate && currentDate <= endDate) {
  //             Packagedetail[i].price_per_person = Packagedetail[i].price_and_date[j].price_per_person;
  //             selectedMonth = startDate.toLocaleString("default", { month: "long" });
  //             priceFound = true;
  //             break;
  //           }
  //         }

  //         if (!priceFound) {
  //           Packagedetail[i].price_per_person = Packagedetail[i].price_and_date[0].price_per_person;
  //           selectedMonth = new Date(Packagedetail[i].price_and_date[0].price_start_date).toLocaleString("default", {
  //             month: "long"
  //           });
  //         }
  //       } else {
  //         Packagedetail[i].price_per_person = Packagedetail[0].price_per_person;
  //       }

  //       const destinationName = Packagedetail[i].destination_name[0];
  //       const matchedProfitMargin = packageProfitMargin.find(
  //         (state) => state.state_name.toLowerCase() === destinationName.toLowerCase()
  //       );

  //       if (matchedProfitMargin) {
  //         const profitMargin = matchedProfitMargin.month_and_margin_user.find(
  //           (margin) => margin.month_name === selectedMonth
  //         );

  //         if (profitMargin) {
  //           adminMarginPercentage = parseFloat(profitMargin.margin_percentage);
  //         }

  //         const adminMarginDecimal = adminMarginPercentage / 100;
  //         Packagedetail[i].price_per_person = Math.round(Packagedetail[i].price_per_person * (1 + adminMarginDecimal));
  //       }
  //     }

  //     if (Packagedetail === null) {
  //       throw new NotFound("Package Data Not Found");
  //     }

  //     return this.sendJSONResponse(
  //       res,
  //       "Packagedetail data retrieved",
  //       {
  //         length: Packagedetail.length
  //       },
  //       Packagedetail
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error);
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  // async ShowPackageDetail(req, res) {
  //   try {
  //     const Packagedetail = await PackageSchema.aggregate([
  //       {
  //         $match: { status: false }
  //       },
  //       {
  //         $lookup: {
  //           from: "destinations",
  //           localField: "destination",
  //           foreignField: "_id",
  //           as: "destination",
  //         }
  //       },
  //       {
  //         $unwind: "$destination"
  //       },
  //       {
  //         $lookup: {
  //           from: "place_to_visits",
  //           localField: "destination._id",
  //           foreignField: "destination_id",
  //           as: "place_to_visits"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "photos",
  //           localField: "place_to_visits._id",
  //           foreignField: "place_to_visit_id",
  //           as: "place_to_visits_photos"
  //         }
  //       },
  //       {
  //         $group: {
  //           _id: "$_id",
  //           name: { $first: "$name" },
  //           price_per_person: { $first: "$price_per_person" },
  //           total_days: { $first: "$total_days" },
  //           total_nights: { $first: "$total_nights" },
  //           destination_id: { $first: "$destination_id" },
  //           destination_category_id: { $first: "$destination_category_id" },
  //           meal_required: { $first: "$meal_required" },
  //           meal_type: { $first: "$meal_type" },
  //           travel_by: { $first: "$travel_by" },
  //           hotel_type: { $first: "$hotel_type" },
  //           more_details: { $first: "$more_details" },
  //           place_to_visit_id: { $first: "$place_to_visit_id" },
  //           include_service: { $first: "$include_service" },
  //           exclude_service: { $first: "$exclude_service" },
  //           status: { $first: "$status" },
  //           sightseeing: { $first: "$sightseeing" },
  //           place_to_visits_photos: { $push: "$place_to_visits_photos" }
  //         }
  //       }
  //     ]);

  //     if (Packagedetail === null || Packagedetail.length === 0) {
  //       throw new NotFound("Package Data Not Found");
  //     }

  //     return this.sendJSONResponse(
  //       res,
  //       "Packagedetail data retrieved",
  //       {
  //         length: 1
  //       },
  //       Packagedetail
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error);
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async packageItinary(req, res) {
    try {
      // console.log("123");
      const destination_id = req.query.destination_id;
      const category_id = req.query.category_id;
      const baseHotelPhotoURL = "https://start-your-tour-api.onrender.com/images/hotel_itienrary/";

      let data;
      if (destination_id) {
        data = await packageSchema.aggregate([
          {
            $match: {
              destination: mongoose.Types.ObjectId(destination_id)
            }
          },
          {
            $lookup: {
              from: "services",
              localField: "include_service",
              foreignField: "_id",
              as: "Include_Services"
            }
          },
          {
            $lookup: {
              from: "services",
              localField: "exclude_service",
              foreignField: "_id",
              as: "Exclude_Services"
            }
          },
          {
            $lookup: {
              from: "destinations",
              localField: "destination",
              foreignField: "_id",
              as: "Destinations"
            }
          },
          {
            $lookup: {
              from: "place_to_visits",
              localField: "destination_id",
              foreignField: "destination_category_id",
              as: "placetovisit"
            }
          },
          {
            $lookup: {
              from: "itineries",
              localField: "_id",
              foreignField: "package_id",
              as: "Itinaries"
            }
          },
          {
            $lookup: {
              from: "hotel_itienraries",
              localField: "Itinaries.hotel_itienrary_id",
              foreignField: "_id",
              as: "hotel_itienrary"
            }
          },
          {
            $addFields: {
              hotel_itienrary: {
                $map: {
                  input: "$hotel_itienrary",
                  as: "hotel",
                  in: {
                    $mergeObjects: [
                      "$$hotel",
                      {
                        days: {
                          $reduce: {
                            input: {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$Itinaries",
                                    as: "itinerary",
                                    cond: {
                                      $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"]
                                    }
                                  }
                                },
                                as: "itinerary",
                                in: {
                                  $toString: "$$itinerary.day"
                                }
                              }
                            },
                            initialValue: "",
                            in: {
                              $cond: {
                                if: { $eq: ["$$value", ""] },
                                then: "$$this",
                                else: { $concat: ["$$value", ",", "$$this"] }
                              }
                            }
                          }
                        },
                        hotel_photo: {
                          $map: {
                            input: "$$hotel.hotel_photo",
                            as: "photo",
                            in: {
                              $concat: [baseHotelPhotoURL, "$$photo"]
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        ]);
        // console.log(data);
      } else if (category_id) {
        // data = await destinationSchema.find();
        data = await packageSchema.aggregate([
          {
            $match: {
              destination_category_id: mongoose.Types.ObjectId(category_id)
            }
          },
          {
            $lookup: {
              from: "destinations",
              localField: "destination",
              foreignField: "destination_category",
              as: "Destinations"
            }
          },
          {
            $lookup: {
              from: "itineries",
              localField: "_id",
              foreignField: "package_id",
              as: "Itinaries"
            }
          },
          {
            $lookup: {
              from: "hotel_itienraries",
              localField: "Itinaries.hotel_itienrary_id",
              foreignField: "_id",
              as: "hotel_itienrary"
            }
          },
          {
            $addFields: {
              hotel_itienrary: {
                $map: {
                  input: "$hotel_itienrary",
                  as: "hotel",
                  in: {
                    $mergeObjects: [
                      "$$hotel",
                      {
                        days: {
                          $reduce: {
                            input: {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$Itinaries",
                                    as: "itinerary",
                                    cond: {
                                      $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"]
                                    }
                                  }
                                },
                                as: "itinerary",
                                in: {
                                  $toString: "$$itinerary.day"
                                }
                              }
                            },
                            initialValue: "",
                            in: {
                              $cond: {
                                if: { $eq: ["$$value", ""] },
                                then: "$$this",
                                else: { $concat: ["$$value", ",", "$$this"] }
                              }
                            }
                          }
                        },
                        hotel_photo: {
                          $map: {
                            input: "$$hotel.hotel_photo",
                            as: "photo",
                            in: {
                              $concat: [baseHotelPhotoURL, "$$photo"]
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        ]);
      } else if (category_id && destination_id) {
        data = await packageSchema.aggregate([
          {
            $match: {
              destination_category: mongoose.Types.ObjectId(category_id)
            }
          },
          {
            $lookup: {
              from: "destinations",
              localField: "destination",
              foreignField: "destination_category",
              as: "Packages"
            }
          },
          {
            $lookup: {
              from: "itineries",
              localField: "_id",
              foreignField: "package_id",
              as: "Itinaries"
            }
          },
          {
            $lookup: {
              from: "hotel_itienraries",
              localField: "Itinaries.hotel_itienrary_id",
              foreignField: "_id",
              as: "hotel_itienrary"
            }
          },
          {
            $addFields: {
              hotel_itienrary: {
                $map: {
                  input: "$hotel_itienrary",
                  as: "hotel",
                  in: {
                    $mergeObjects: [
                      "$$hotel",
                      {
                        days: {
                          $reduce: {
                            input: {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$Itinaries",
                                    as: "itinerary",
                                    cond: {
                                      $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"]
                                    }
                                  }
                                },
                                as: "itinerary",
                                in: {
                                  $toString: "$$itinerary.day"
                                }
                              }
                            },
                            initialValue: "",
                            in: {
                              $cond: {
                                if: { $eq: ["$$value", ""] },
                                then: "$$this",
                                else: { $concat: ["$$value", ",", "$$this"] }
                              }
                            }
                          }
                        },
                        hotel_photo: {
                          $map: {
                            input: "$$hotel.hotel_photo",
                            as: "photo",
                            in: {
                              $concat: [baseHotelPhotoURL, "$$photo"]
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          },
          {
            $match: {
              Packages: { destination: mongoose.Types.ObjectId(destination_id) }
            }
          }
        ]);
      } else {
        data = await packageSchema.aggregate([
          {
            $lookup: {
              from: "destinations",
              localField: "_id",
              foreignField: "destination",
              as: "Destination"
            }
          },
          {
            $lookup: {
              from: "itineries",
              localField: "_id",
              foreignField: "package_id",
              as: "Itinaries"
            }
          }
        ]);
        // data.foreach((data) => {
        //   console.log(data);
        // });
      }
      // console.log(data[0].placetovisit);
      // console.log(data);
      // data.forEach((element) => {
      // console.log(element.placetovisit[0]);
      //   element.placetovisit.forEach((p) => {
      //     p.photo = generateFileDownloadLinkPrefix(req.localHostURL) + p.photo;
      //   });

      //   element.Itinaries.forEach((i) => {
      //     i.photo = generateFileDownloadLinkPrefix(req.localHostURL) + i.photo;
      //   });
      // });
      return this.sendJSONResponse(
        res,
        "",
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

  async UpdatePackageDetail(req, res) {
    try {
      const id = req.params.id;
      // const tokenData = req.userData;
      // const adminData = await adminSchema.find({ _id: tokenData.id });

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
      if (userData[0].role !== "admin" && userData[0].role !== "agency") {
        throw new Forbidden("you are not admin");
      }

      const Packagedatainsert = await PackageSchema.find({ _id: id });
      if (Packagedatainsert === null) {
        throw new NotFound("Package Data Not Found");
      }

      // const packageStartDate = new Date(req.body.start_date);
      // const packageEndDate = new Date(req.body.end_date);

      // Get price and date arrays
      const priceAndDateArray = req.body.price_and_date;

      // Validate for overlapping or duplicate date ranges
      for (let i = 0; i < priceAndDateArray.length; i++) {
        const currentStartDate = new Date(priceAndDateArray[i].price_start_date);
        const currentEndDate = new Date(priceAndDateArray[i].price_end_date);

        // Ensure the start date is before the end date
        if (currentStartDate >= currentEndDate) {
          throw new Forbidden(`Dates are mismatched, please change the dates in Price Range`);
        }

        // Ensure price start and end dates fall within the package start and end dates
        // if (currentStartDate < packageStartDate || currentEndDate > packageEndDate) {
        //   throw new Forbidden(`Invalid Date`);
        // }

        // Check for overlapping date ranges within the price_and_date array
        for (let j = 0; j < priceAndDateArray.length; j++) {
          if (i !== j) {
            // Don't compare the same element
            const nextStartDate = new Date(priceAndDateArray[j].price_start_date);
            const nextEndDate = new Date(priceAndDateArray[j].price_end_date);

            // Check for overlapping date ranges
            if (currentStartDate <= nextEndDate && currentEndDate >= nextStartDate) {
              throw new Forbidden(`Dates are mismatched, please change the dates in Price Range`);
            }
          }
        }
      }

      const updateddata = await PackageSchema.findByIdAndUpdate({ _id: id }, req.body);
      return this.sendJSONResponse(
        res,
        "data updated",
        {
          length: 1
        },
        updateddata
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async AddPackageServices(req, res) {
    try {
      const id = req.params.id;
      const data = {
        include_service: req.body.inclue_service,
        exclude_service: req.body.exclude_service,
        status: "true"
      };
      // data.include_service.forEach(element => {
      //     element = mongoose.Types.ObjectId(element)
      // });
      // data.exclude_service.forEach(element => {
      //     element = mongoose.Types.ObjectId(element)
      // });

      const updatedData = await PackageSchema.findByIdAndUpdate({ _id: id }, data);

      return this.sendJSONResponse(
        res,
        "update services in bid",
        {
          length: 1
        },
        updatedData
      );
    } catch (error) {}
  }

  async DeletePackageData(req, res) {
    try {
      const id = req.params.id;

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
      if (userData[0].role !== "admin" && userData[0].role !== "agency") {
        throw new Forbidden("you are not admin");
      }

      const Packagedatainsert = await PackageSchema.findByIdAndUpdate({ _id: id }, { status: 0 });
      return this.sendJSONResponse(
        res,
        "Package data deleted",
        {
          length: 1
        },
        Packagedatainsert
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_agency_package(req, res) {
    try {
      const tokenData = req.userData;

      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData);
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      const baseHotelPhotoURL = "https://start-your-tour-api.onrender.com/images/hotel_itienrary/";

      let displayData = await PackageSchema.aggregate([
        {
          $match: { user_id: mongoose.Types.ObjectId(tokenData.id) }
        },
        {
          $lookup: {
            from: "destination_categories",
            localField: "destination_category_id",
            foreignField: "_id",
            as: "destination_category_id"
          }
        },
        {
          $lookup: {
            from: "destinations",
            localField: "destination",
            foreignField: "_id",
            as: "destination"
          }
        },
        {
          $lookup: {
            from: "place_to_visits",
            localField: "place_to_visit_id",
            foreignField: "_id",
            as: "Place"
          }
        },
        {
          $lookup: {
            from: "itineries",
            localField: "_id",
            foreignField: "package_id",
            as: "Itinaries"
          }
        },
        {
          $lookup: {
            from: "hotel_itienraries",
            localField: "Itinaries.hotel_itienrary_id",
            foreignField: "_id",
            as: "hotel_itienrary"
          }
        },
        {
          $addFields: {
            hotel_itienrary: {
              $map: {
                input: "$hotel_itienrary",
                as: "hotel",
                in: {
                  $mergeObjects: [
                    "$$hotel",
                    {
                      days: {
                        $reduce: {
                          input: {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$Itinaries",
                                  as: "itinerary",
                                  cond: {
                                    $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"]
                                  }
                                }
                              },
                              as: "itinerary",
                              in: {
                                $toString: "$$itinerary.day"
                              }
                            }
                          },
                          initialValue: "",
                          in: {
                            $cond: {
                              if: { $eq: ["$$value", ""] },
                              then: "$$this",
                              else: { $concat: ["$$value", ",", "$$this"] }
                            }
                          }
                        }
                      },
                      hotel_photo: {
                        $map: {
                          input: "$$hotel.hotel_photo",
                          as: "photo",
                          in: {
                            $concat: [baseHotelPhotoURL, "$$photo"]
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "agency_details",
            pipeline: [
              {
                $lookup: {
                  from: "agencypersonals",
                  localField: "_id",
                  foreignField: "user_id",
                  as: "agency_personal_details"
                }
              },
              {
                $project: {
                  password: 0
                }
              }
            ]
          }
        }
      ]);

      const packageProfitMargin = await package_profit_margin.find();

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      // const currentMonth = monthNames[startDateObject.getMonth()]; // Get the month name
      // console.log(currentMonth);

      const currentDate = new Date();

      if (displayData.length === 0) {
        throw new Forbidden("package not exists");
      }

      for (let i = 0; i < displayData[0].include_service.length; i++) {
        displayData[0].include_service[i] = { include_services_value: displayData[0].include_service[i] };
      }
      for (let i = 0; i < displayData[0].exclude_service.length; i++) {
        displayData[0].exclude_service[i] = { exclude_services_value: displayData[0].exclude_service[i] };
      }
      // displayData[0].meal_required = displayData[0].mexired[0];
      displayData[0].day = displayData[0].total_days + "D/" + displayData[0].total_nights + "N";
      displayData[0].Itinaries.forEach(async (element) => {
        element.photo = await image_url("itinary", element.photo);
      });
      displayData[0].Place[0].photo = await image_url("placephoto", displayData[0].Place[0].photo);

      for (let i = 0; i < displayData.length; i++) {
        let priceFound = false;
        let adminMarginPercentage = 10; // Default margin
        let selectedMonth = null;

        if (displayData[i].price_and_date && displayData[i].price_and_date.length > 0) {
          for (let j = 0; j < displayData[i].price_and_date.length; j++) {
            const startDate = new Date(displayData[i].price_and_date[j].price_start_date);
            const endDate = new Date(displayData[i].price_and_date[j].price_end_date);

            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            currentDate.setHours(0, 0, 0, 0);

            if (currentDate >= startDate && currentDate <= endDate) {
              displayData[i].price_per_person = displayData[i].price_and_date[j].price_per_person;
              selectedMonth = startDate.toLocaleString("default", { month: "long" });
              console.log(selectedMonth);
              priceFound = true;
              break;
            }
          }
          // If no matching price was found, use the first available price
          if (!priceFound) {
            displayData[i].price_per_person = displayData[i].price_and_date[0].price_per_person;
            selectedMonth = new Date(displayData[i].price_and_date[0].price_start_date).toLocaleString("default", {
              month: "long"
            });
          }
        } else {
          displayData[i].price_per_person = displayData[0].price_per_person;
        }

        console.log("📅 Selected Month:", selectedMonth);

        let destinationName = displayData[i].destination[0].destination_name;
        console.log(destinationName);

        const matchedProfitMargin = packageProfitMargin.find(
          (state) => state.state_name.toLowerCase() === destinationName.toLowerCase()
        );
        console.log("Matched Profit Margin:", matchedProfitMargin);

        if (matchedProfitMargin) {
          const profitMargin = matchedProfitMargin.month_and_margin_user.find(
            (margin) => margin.month_name === selectedMonth
          );

          console.log("Profit Margin:", profitMargin);

          if (profitMargin) {
            adminMarginPercentage = parseFloat(profitMargin.margin_percentage);
          }

          displayData[i].adminMarginPercentage = adminMarginPercentage;
          console.log("💰 Applied Admin Margin:", adminMarginPercentage);

          const adminMarginDecimal = adminMarginPercentage / 100;

          // Calculate final price
          displayData[i].price_per_person = Math.round(displayData[i].price_per_person * (1 + adminMarginDecimal));
        } else {
          // If no match is found, create a new profit margin with admin_margin 0 for all months
          // packageData[0].profitMargin = [
          //   {
          //     state_name: destinationName,
          //     month_and_margin_user: defaultMonths.map((month) => ({
          //       month_name: month,
          //       margin_percentage: "10"
          //     }))
          //   }
          // ];

          displayData[i].adminMarginPercentage = adminMarginPercentage;
          console.log("💰 Applied Admin Margin:", adminMarginPercentage);

          const adminMarginDecimal = adminMarginPercentage / 100;

          // Calculate final price
          displayData[i].price_per_person = Math.round(displayData[i].price_per_person * (1 + adminMarginDecimal));
        }

        // Step 3: Find Profit Margin based on selectedMonth
        const profitMargin = packageProfitMargin.find((margin) => margin.month_name === selectedMonth);

        let priceAndDateArray = displayData[i].price_and_date;
        let largestEndDate = new Date(0); // Initialize with a very old date
        // const currentDate = new Date(); // Get the current date

        if (priceAndDateArray && priceAndDateArray.length > 0) {
          for (let j = 0; j < priceAndDateArray.length; j++) {
            const endDate = new Date(priceAndDateArray[j].price_end_date);

            // Compare and find the largest end date
            if (endDate > largestEndDate) {
              largestEndDate = endDate;
            }
          }

          largestEndDate.setHours(currentDate.getHours());
          largestEndDate.setMinutes(currentDate.getMinutes());
          largestEndDate.setSeconds(currentDate.getSeconds());
          largestEndDate.setMilliseconds(currentDate.getMilliseconds());

          // After finding the largest end date, compare it with the current date
          if (largestEndDate < currentDate && largestEndDate != currentDate) {
            displayData[i].status = "expired";
          } else {
            displayData[i].status = displayData[i].status;
          }
        }

        console.log("largestEndDate:", largestEndDate.toISOString());
        console.log("currentDate:", currentDate.toISOString());
      }

      return this.sendJSONResponse(
        res,
        "agency Package data display successfully",
        {
          length: 1
        },
        displayData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async updatePackagesStatus(req, res) {
  //   try {
  //     const tokenData = req.userData;

  //     if (!tokenData) {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }

  //     const userData = await userSchema.findOne({ _id: tokenData.id });

  //     if (!userData || userData.role !== "agency") {
  //       return res.status(403).json({
  //         message: "You are not authorized to perform this action."
  //       });
  //     }

  //     const expiredPackages = await PackageSchema.find({
  //       user_id: tokenData.id,
  //       package_valid_till_for_booking: { $lt: new Date() }
  //     });

  //     console.log("expiredPackages:", expiredPackages)

  //     if (!expiredPackages.length) {
  //       return res.status(200).json({ message: 'No expired packages found.' });
  //     }

  //     // Extract the package IDs
  //     const expiredPackageIds = expiredPackages.map(pkg => pkg._id);

  //     console.log("expiredPackageIds:", expiredPackageIds)

  //     // Update the status of bid packages associated with these expired packages, only if their status is not 'booked'
  //     const result = await Bidschema.updateMany(
  //       {
  //         custom_package_id: { $in: expiredPackageIds },
  //         agency_id: tokenData.id,
  //         bid_status: { $ne: 'booked' } // Ensuring that 'booked' packages are not updated
  //       },
  //       { $set: { bid_status: 'expired' } }
  //     );

  //     console.log("result:", result)

  //     if (result.nModified > 0) {
  //       res.status(200).json({ success: true, message: 'Bid package statuses updated successfully.', data: result });
  //     } else {
  //       res.status(200).json({ success: true, message: 'No bid package statuses were updated.' });
  //     }
  //   } catch (error) {
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }
};
