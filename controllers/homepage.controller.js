const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const niv = require("node-input-validator");
const destinationCategorySchema = require("../models/DestinationCategorySchema");
const safetyinfoSchema = require("../models/SafetyinfoSchema");
const destinationSchema = require("../models/DestinationSchema");
const DescriptionSchema = require("../models/DescriptionSchema");
const siderSchema = require("../models/sliderSchema");
const visa_on_Arrival_Schema = require("../models/visa_on_arrival.Schema");
const { generateFileDownloadLinkPrefix, generateDownloadLink } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const fn = "dastinationcategory";
const hotel_model = require("../models/hotel_syt_schema");
const ReviewSchema = require("../models/reviewSchema.js");
const package_profit_margin = require("../models/package_profit_margin.js");
module.exports = class HomepageController extends BaseController {
  async Show_homepage_Data(req, res) {
    try {
      // const display_slider = await siderSchema.find();
      // console.log(display_slider);
      // for (let i = 0; i < display_slider.length; i++) {
      //   for (let j = 0; j < display_slider[i].photo.length; j++) {
      //     display_slider[i].photo[j] = generateFileDownloadLinkPrefix(req.localHostURL) + display_slider[i].photo[j];
      //   }
      // }

      const visa_on_Arrival = await visa_on_Arrival_Schema.aggregate([
        {
          $lookup: {
            from: "destinations",
            localField: "destination_id",
            foreignField: "_id",
            as: "destinations",
            pipeline: [
              {
                $lookup: {
                  from: "destinations",
                  localField: "destination_id",
                  foreignField: "_id",
                  as: "destinations"
                }
              }
            ]
          }
        }
      ]);

      const DestinationData = await destinationCategorySchema.find({ status: 1 });
      if (DestinationData.length === 0) {
        throw new Forbidden("Destination Data Not Found");
      }
      // DestinationData.forEach((element) => {
      //   element.photo = generateFileDownloadLinkPrefix(req.localHostURL) + element.photo;
      // });
      for (let i = 0; i < DestinationData.length; i++) {
        const element = DestinationData[i];
        element.photo = await image_url(fn, element.photo);
      }

      const Displaymostlovaeddestionation = await destinationSchema.aggregate([
        {
          $match: {
            $and: [{ most_loved_destionation: true }]
          }
        },
        {
          $lookup: {
            from: "place_to_visits",
            localField: "_id",
            foreignField: "destination_id",
            as: "place_to_visits"
          }
        },
        {
          $project: {
            _id: 1,
            destination_name: 1,
            place_to_visits: {
              photo: 1
            }
          }
        }
      ]);
      for (let i = 0; i < Displaymostlovaeddestionation.length; i++) {
        // Displaymostlovaeddestionation[i].place_to_visits = generateDownloadLink(
        //   Displaymostlovaeddestionation[i].place_to_visits[0].photo,
        //   req.localHostURL
        // );
        Displaymostlovaeddestionation[i].place_to_visits = await image_url(
          "placephoto",
          Displaymostlovaeddestionation[i].place_to_visits[0].photo
        );
        // Displaymostlovaeddestionation[i].place_to_visits =
        //   generateFileDownloadLinkPrefix(req.localHostURL) + Displaymostlovaeddestionation[i].place_to_visits[0].photo;
      }

      const DisplaySaftyinfo = await DescriptionSchema.aggregate([
        {
          $lookup: {
            from: "safetyinfos",
            localField: "_id",
            foreignField: "description_id",
            as: "safetyinfo"
          }
        }
      ]);

      for (let i = 0; i < DisplaySaftyinfo.length; i++) {
        for (let j = 0; j < DisplaySaftyinfo[i].safetyinfo.length; j++) {
          // DisplaySaftyinfo[i].safetyinfo[j].safetyinfo_photo = generateDownloadLink(
          //   DisplaySaftyinfo[i].safetyinfo[j].safetyinfo_photo,
          //   req.localHostURL
          // );
          DisplaySaftyinfo[i].safetyinfo[j].safetyinfo_photo = await image_url(
            "safetyinfo",
            DisplaySaftyinfo[i].safetyinfo[j].safetyinfo_photo
          );
        }
      }
      const info = {
        _id: DisplaySaftyinfo[0]._id,
        description: DisplaySaftyinfo[0].description,
        __v: DisplaySaftyinfo[0].__v
      };
      const safetyinfo = DisplaySaftyinfo[0].safetyinfo;
      const adddata = [{ info: info, safetyinfo: safetyinfo }];

      const hotel_syt_display = await hotel_model.aggregate([
        {
          $match: {
            status: "active"
          }
        },
        {
          $lookup: {
            from: "room_syts",
            localField: "_id",
            foreignField: "hotel_id",
            as: "room",
            pipeline: [
              {
                $match: { status: "available" }
              },
              {
                $lookup: {
                  from: "room_prices",
                  localField: "_id",
                  foreignField: "room_id",
                  as: "room_price",
                  pipeline: [
                    { $unwind: "$price_and_date" },
                    {
                      $group: {
                        _id: "$room_id",
                        price_and_date: { $push: "$price_and_date" },
                        othere_future_agency: { $first: "$othere_future_agency" }
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  price_and_date: { $arrayElemAt: ["$room_price.price_and_date", 0] },
                  othere_future_agency: { $arrayElemAt: ["$room_price.othere_future_agency", 0] }
                }
              },
              { $unset: "room_price" }
            ]
          }
        },
        {
          $match: {
            "room.0": { $exists: true } // Exclude hotels with an empty room array
          }
        },
        {
          $sort: { _id: -1 }
        },
        {
          $limit: 10
        }
      ]);

      const packageProfitMargin = await package_profit_margin.find();

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
      const currentMonthName = defaultMonths[new Date().getMonth()];

      for (let i = 0; i < hotel_syt_display.length; i++) {
        for (let j = 0; j < hotel_syt_display[i].hotel_photo.length; j++) {
          hotel_syt_display[i].hotel_photo[j] = await image_url(fn, hotel_syt_display[i].hotel_photo[j]);
        }
        let minRoomPrice = null; // Track minimum price for this hotel
        let destinationName = hotel_syt_display[i].state;

        const matchedProfitMargin = packageProfitMargin.find((state) => state.state_name === destinationName);
        let adminMargin = 10; // Default margin

        if (matchedProfitMargin) {
          const marginData = matchedProfitMargin.month_and_margin_user.find((m) => m.month_name === currentMonthName);
          if (marginData) {
            adminMargin = parseFloat(marginData.margin_percentage);
          }
        }

        for (let j = 0; j < hotel_syt_display[i].room.length; j++) {
          let currentDate = new Date();
          let priceFound = false;
          let selectedPrice = null;

          if (hotel_syt_display[i].room[j].price_and_date && hotel_syt_display[i].room[j].price_and_date.length > 0) {
            for (let k = 0; k < hotel_syt_display[i].room[j].price_and_date.length; k++) {
              const priceStartDate = new Date(hotel_syt_display[i].room[j].price_and_date[k].price_start_date);
              const priceEndDate = new Date(hotel_syt_display[i].room[j].price_and_date[k].price_end_date);

              if (currentDate >= priceStartDate && currentDate <= priceEndDate) {
                selectedPrice = hotel_syt_display[i].room[j].price_and_date[k].adult_price;
                priceFound = true;
                break;
              }
            }

            if (!priceFound) {
              selectedPrice = hotel_syt_display[i].room[j].price_and_date[0].adult_price;
            }

            selectedPrice += (selectedPrice * adminMargin) / 100;

            if (minRoomPrice === null || selectedPrice < minRoomPrice) {
              minRoomPrice = selectedPrice;
            }
          }

          for (let k = 0; k < hotel_syt_display[i].room[j].photos.length; k++) {
            hotel_syt_display[i].room[j].photos[k] = await image_url("room_syt", hotel_syt_display[i].room[j].photos[k]);
          }
        }

        hotel_syt_display[i].profitMargin = [
          {
            state_name: destinationName,
            margin_percentage: adminMargin
          }
        ];
        hotel_syt_display[i].min_room_price = Math.round(minRoomPrice);
      }
      const result = [
        {
          visa_on_Arrival: visa_on_Arrival,
          DestinationData: DestinationData,
          most_lovaed_destionation: Displaymostlovaeddestionation,
          Saftyinformation: adddata,
          hotel_data: hotel_syt_display
        }
      ];

      return this.sendJSONResponse(
        res,

        "data retrived",
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

  async travel_ai_dashboard(req, res) {
    try {
      let top_collection = await destinationSchema.aggregate([
        {
          $match: {
            status: true
          }
        },
        {
          $lookup: {
            from: "place_to_visits",
            localField: "_id",
            foreignField: "destination_id",
            as: "place_to_visits",
            pipeline: [
              {
                $limit: 3
              }
            ]
          }
        },

        {
          $lookup: {
            from: "packages",
            localField: "_id",
            foreignField: "destination",
            as: "Package",
            pipeline: [
              {
                $match: { status: true }
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
                $match: {
                  $and: [
                    { "Itinaries.0": { $exists: true } }, // Checks if there's at least one itinerary
                    { "hotel_itienrary.0": { $exists: true } } // Checks if there's at least one hotel itinerary
                  ]
                }
              }
            ]
          }
        },
        {
          $project: {
            _id: 1,
            destination_name: 1,
            place_to_visits: {
              photo: 1
            },
            Package: {
              name: 1,
              price_and_date: 1,
              total_days: 1,
              total_nights: 1
            }
          }
        }
      ]);

      const destinationReviews = await ReviewSchema.aggregate([
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
            total_reviews: { $sum: 1 }, // Total number of reviews
            total_rating: { $sum: "$star_numeric" } // Sum of all ratings
          }
        },
        {
          $project: {
            destination_id: "$_id",
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

      top_collection = top_collection.filter((destination) => destination.Package && destination.Package.length > 0);

      top_collection = top_collection.slice(0, 3);

      const reviewMap = {};
      destinationReviews.forEach((review) => {
        const key = review.destination_id?.toString(); // ✅ Prevent null crash
        if (key) {
          reviewMap[key] = review;
        }
      });

      top_collection.forEach((destination) => {
        const reviewData = reviewMap[destination._id.toString()] || { avg_rating: 0, total_reviews: 0 };
        destination.avg_rating = Number(reviewData.avg_rating.toFixed(1));
        destination.total_reviews = reviewData.total_reviews;
      });

      const packageProfitMargins = await package_profit_margin.find();
      const currentDate = new Date();

      for (let i = 0; i < top_collection.length; i++) {
        if (top_collection[i].Package) {
          top_collection[i].Package = top_collection[i].Package.filter((package1) => {
            if (package1.price_and_date && package1.price_and_date.length > 0) {
              return package1.price_and_date.some((priceEntry) => {
                const endDate = new Date(priceEntry.price_end_date);
                console.log(endDate);
                const currentDateWithoutTime = new Date(currentDate.toDateString());

                // ✅ **If end date is before today, remove package**
                return endDate >= currentDateWithoutTime;
              });
            }
            return false; // Exclude packages without valid price_and_date
          });
        }
      }

      function findMinimumPriceDetails(package1, currentDate) {
        let minPrice = null;
        let selectedMonth = null;
        let selectedStartDate = null;

        if (package1.price_and_date && package1.price_and_date.length > 0) {
          // First check current date range
          for (const priceEntry of package1.price_and_date) {
            const startDate = new Date(priceEntry.price_start_date);
            const endDate = new Date(priceEntry.price_end_date);

            if (currentDate >= startDate && currentDate <= endDate) {
              if (minPrice === null || priceEntry.price_per_person < minPrice) {
                minPrice = priceEntry.price_per_person;
                selectedMonth = startDate.toLocaleString("default", { month: "long" });
                selectedStartDate = startDate;
              }
            }
          }

          // If no current price found, find next available price
          if (minPrice === null) {
            let nearestFutureDate = null;

            for (const priceEntry of package1.price_and_date) {
              const startDate = new Date(priceEntry.price_start_date);
              const endDate = new Date(priceEntry.price_end_date);

              if (endDate >= currentDate) {
                if (nearestFutureDate === null || startDate < nearestFutureDate) {
                  minPrice = priceEntry.price_per_person;
                  selectedMonth = startDate.toLocaleString("default", { month: "long" });
                  selectedStartDate = startDate;
                  nearestFutureDate = startDate;
                }
              }
            }
          }
        }

        return { minPrice, selectedMonth, selectedStartDate };
      }

      function calculateAdminMargin(destinationName, selectedMonth, packageProfitMargins) {
        const defaultMargin = 10;

        const profitMargin = packageProfitMargins.find((margin) => margin.state_name === destinationName);

        if (!profitMargin || !selectedMonth) {
          return defaultMargin;
        }

        const monthMargin = profitMargin.month_and_margin_user.find(
          (margin) => margin.month_name.toLowerCase() === selectedMonth.toLowerCase()
        );

        return monthMargin ? monthMargin.margin_percentage : defaultMargin;
      }

      for (let i = 0; i < top_collection.length; i++) {
        let minPriceAcrossPackages = null;
        let selectedPackage = null;
        let finalSelectedMonth = null;

        if (top_collection[i].Package) {
          for (const package1 of top_collection[i].Package) {
            const { minPrice, selectedMonth } = findMinimumPriceDetails(package1, currentDate);

            if (minPrice !== null && (minPriceAcrossPackages === null || minPrice < minPriceAcrossPackages)) {
              minPriceAcrossPackages = minPrice;
              selectedPackage = package1;
              finalSelectedMonth = selectedMonth;
            }
          }

          const element = top_collection[i];

          if (selectedPackage && minPriceAcrossPackages !== null) {
            // Calculate admin margin
            const adminMarginPercentage = calculateAdminMargin(
              element.destination_name,
              finalSelectedMonth,
              packageProfitMargins
            );

            // Calculate final price with margin
            const adjustedPrice = minPriceAcrossPackages + (minPriceAcrossPackages * adminMarginPercentage) / 100;

            // Keep only one selected package with required fields and final price
            element.Package = [
              {
                name: selectedPackage.name,
                total_days: selectedPackage.total_days,
                total_nights: selectedPackage.total_nights,
                price_per_person: Math.round(adjustedPrice) // Round if needed
              }
            ];
          } else {
            element.Package = []; // No valid package, clear it
          }
        }
      }

      for (let i = 0; i < top_collection.length; i++) {
        for (let j = 0; j < top_collection[i].place_to_visits.length; j++) {
          // top_collection[i].place_to_visits[j].photo = generateDownloadLink(
          //   top_collection[i].place_to_visits[j].photo,
          //   req.localHostURL
          // );
          top_collection[i].place_to_visits[j].photo = await image_url(
            "placephoto",
            top_collection[i].place_to_visits[j].photo
          );
        }
      }

      let best_hotels = await hotel_model.aggregate([
        {
          $match: {
            status: "active"
          }
        },
        {
          $lookup: {
            from: "room_syts",
            localField: "_id",
            foreignField: "hotel_id",
            as: "room",
            pipeline: [
              {
                $match: { status: "available" }
              },
              {
                $lookup: {
                  from: "room_prices",
                  localField: "_id",
                  foreignField: "room_id",
                  as: "room_price",
                  pipeline: [
                    { $unwind: "$price_and_date" },
                    {
                      $group: {
                        _id: "$room_id",
                        price_and_date: { $push: "$price_and_date" },
                        othere_future_agency: { $first: "$othere_future_agency" }
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  price_and_date: { $arrayElemAt: ["$room_price.price_and_date", 0] },
                  othere_future_agency: { $arrayElemAt: ["$room_price.othere_future_agency", 0] }
                }
              },
              { $unset: "room_price" }
            ]
          }
        },
        {
          $match: {
            "room.0": { $exists: true } // Exclude hotels with an empty room array
          }
        },
        {
          $project: {
            _id: 1,
            hotel_name: 1,
            hotel_photo: 1,
            hotel_description: { $substrCP: ["$hotel_description", 0, 250] },
            hotel_address: { $substrCP: ["$hotel_address", 0, 250] },
            hotel_type: 1,
            hotel_photo: 1,
            city: 1,
            state: 1,
            // other: 1,
            status: 1,
            createdAt: 1
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $limit: 3
        }
      ]);

      for (let i = 0; i < best_hotels.length; i++) {
        for (let j = 0; j < best_hotels[i].hotel_photo.length; j++) {
          best_hotels[i].hotel_photo[j] = await image_url("hotel_syt", best_hotels[i].hotel_photo[j]);
        }
      }

      const result = [
        {
          top_collection: top_collection,
          best_hotels: best_hotels
        }
      ];

      return this.sendJSONResponse(
        res,

        "Data Found",
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

  async new_syt_desing_dashboard(req, res) {
    try {
      const Displaymostlovaeddestionation = await destinationSchema.aggregate([
        {
          $match: {
            $and: [{ most_loved_destionation: true }]
          }
        },
        {
          $lookup: {
            from: "place_to_visits",
            localField: "_id",
            foreignField: "destination_id",
            as: "place_to_visits"
          }
        },
        {
          $project: {
            _id: 1,
            destination_name: 1,
            place_to_visits: {
              photo: 1
            }
          }
        }
      ]);

      for (let i = 0; i < Displaymostlovaeddestionation.length; i++) {
        // Displaymostlovaeddestionation[i].place_to_visits = generateDownloadLink(
        //   Displaymostlovaeddestionation[i].place_to_visits[0].photo,
        //   req.localHostURL
        // );
        Displaymostlovaeddestionation[i].place_to_visits = await image_url(
          "placephoto",
          Displaymostlovaeddestionation[i].place_to_visits[0].photo
        );
        // Displaymostlovaeddestionation[i].place_to_visits =
        //   generateFileDownloadLinkPrefix(req.localHostURL) + Displaymostlovaeddestionation[i].place_to_visits[0].photo;
      }

      const DestinationData = await destinationCategorySchema.find({ status: 1 });

      const packageProfitMargin = await package_profit_margin.find();

      let hotel = await hotel_model.aggregate([
        {
          $match: { status: "active" }
        },
        {
          $lookup: {
            from: "room_syts",
            localField: "_id",
            foreignField: "hotel_id",
            as: "room",
            pipeline: [
              {
                $match: { status: "available" }
              },
              {
                $lookup: {
                  from: "room_prices",
                  localField: "_id",
                  foreignField: "room_id",
                  as: "room_price",
                  pipeline: [
                    { $unwind: "$price_and_date" },
                    {
                      $group: {
                        _id: "$room_id",
                        price_and_date: { $push: "$price_and_date" },
                        othere_future_agency: { $first: "$othere_future_agency" }
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  price_and_date: { $arrayElemAt: ["$room_price.price_and_date", 0] },
                  othere_future_agency: { $arrayElemAt: ["$room_price.othere_future_agency", 0] }
                }
              },
              { $unset: "room_price" }
            ]
          }
        },
        {
          $match: {
            "room.0": { $exists: true } // Exclude hotels with an empty room array
          }
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            hotel_name: 1,
            hotel_address: 1,
            hotel_description: 1,
            hotel_highlights: 1,
            city: 1,
            hotel_type: 1,
            state: 1,
            other: 1,
            hotel_photo: 1,
            status: 1,
            min_room_price: 1,
            room: 1,
            createdAt: 1,
            hotel_review: { $arrayElemAt: ["$hotel_review.star", 0] }
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        }
      ]);

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
      const currentMonthName = defaultMonths[new Date().getMonth()];

      for (let i = 0; i < hotel.length; i++) {
        for (let j = 0; j < hotel[i].hotel_photo.length; j++) {
          hotel[i].hotel_photo[j] = await image_url(fn, hotel[i].hotel_photo[j]);
        }
        let minRoomPrice = null; // Track minimum price for this hotel
        let destinationName = hotel[i].state;

        const matchedProfitMargin = packageProfitMargin.find((state) => state.state_name === destinationName);
        let adminMargin = 10; // Default margin

        if (matchedProfitMargin) {
          const marginData = matchedProfitMargin.month_and_margin_user.find((m) => m.month_name === currentMonthName);
          if (marginData) {
            adminMargin = parseFloat(marginData.margin_percentage);
          }
        }

        for (let j = 0; j < hotel[i].room.length; j++) {
          let currentDate = new Date();
          let priceFound = false;
          let selectedPrice = null;

          if (hotel[i].room[j].price_and_date && hotel[i].room[j].price_and_date.length > 0) {
            for (let k = 0; k < hotel[i].room[j].price_and_date.length; k++) {
              const priceStartDate = new Date(hotel[i].room[j].price_and_date[k].price_start_date);
              const priceEndDate = new Date(hotel[i].room[j].price_and_date[k].price_end_date);

              if (currentDate >= priceStartDate && currentDate <= priceEndDate) {
                selectedPrice = hotel[i].room[j].price_and_date[k].adult_price;
                priceFound = true;
                break;
              }
            }

            if (!priceFound) {
              selectedPrice = hotel[i].room[j].price_and_date[0].adult_price;
            }

            selectedPrice += (selectedPrice * adminMargin) / 100;

            if (minRoomPrice === null || selectedPrice < minRoomPrice) {
              minRoomPrice = selectedPrice;
            }
          }

          for (let k = 0; k < hotel[i].room[j].photos.length; k++) {
            hotel[i].room[j].photos[k] = await image_url("room_syt", hotel[i].room[j].photos[k]);
          }
        }

        hotel[i].profitMargin = [
          {
            state_name: destinationName,
            margin_percentage: adminMargin
          }
        ];
        hotel[i].min_room_price = Math.round(minRoomPrice);
      }

      let result = [
        {
          most_lovaed_destionation: Displaymostlovaeddestionation,
          are_you_looking_for: DestinationData,
          best_hotels: hotel
        }
      ];

      return this.sendJSONResponse(
        res,

        "Data Found",
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
