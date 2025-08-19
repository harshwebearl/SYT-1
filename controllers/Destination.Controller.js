const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const DestinationSchema = require("../models/DestinationSchema");
const niv = require("node-input-validator");
const mongoose = require("mongoose");
// const userSchema = require("../models/customerSchema");
const userSchema = require("../models/usersSchema");
const destinationSchema = require("../models/DestinationSchema");
const adminSchema = require("../models/AdminSchema");
const { generateFileDownloadLinkPrefix, generateDownloadLink } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const package_profit_margin = require("../models/package_profit_margin.js");
const ReviewSchema = require("../models/reviewSchema.js");
const fn = "placephoto";
module.exports = class destinationnameController extends BaseController {
  async RegisterDestination(req, res) {
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

      const insertData = new DestinationSchema(req.body);
      const data = await insertData.save();
      return this.sendJSONResponse(
        res,
        "Destination data saved",
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

  async display_Destination(req, res) {
    try {
      // const tokenData = req.userData;
      // if (tokenData === "") {
      //   return res.status(401).json({
      //     message: "Auth fail"
      //   });
      // }
      // const userData = await userSchema.find({ _id: tokenData.id });
      // console.log(userData);
      // if (userData[0].role !== "admin") {
      //   throw new Forbidden("you are not admin");
      // }

      const DestinationData = await DestinationSchema.aggregate([
        {
          $lookup: {
            from: "place_to_visits",
            localField: "_id",
            foreignField: "destination_id",
            as: "place_to_visit"
          }
        },
        {
          $project: {
            _id: 1,
            destination_name: 1,
            destination_category_id: 1,
            how_to_reach: 1,
            about_destination: 1,
            best_time_for_visit: 1,
            status: 1,
            most_loved_destionation: 1,
            photo: { $arrayElemAt: ["$place_to_visit.photo", 0] }
          }
        }
      ]);

      for (let i = 0; i < DestinationData.length; i++) {
        DestinationData[i].photo = await image_url(fn, DestinationData[i].photo);
      }

      // if (DestinationData.length === 0) {
      //   throw new Forbidden("Destination Data Not Found");
      // }
      // DestinationData.forEach((element) => {
      //   element.photo = generateDownloadLink(element.photo, req.localHostURL);
      // });
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

  async getDestinationData(req, res) {
    try {
      const destination_id = req.query.destination_id;

      let pipeline = [];
      if (!destination_id) {
        pipeline = [
          {
            $lookup: {
              from: "place_to_visits",
              localField: "_id",
              foreignField: "destination_id",
              as: "Place_to_visit"
            }
          }
        ];
      } else {
        pipeline = [
          {
            $match: {
              _id: mongoose.Types.ObjectId(destination_id)
            }
          },
          {
            $lookup: {
              from: "place_to_visits",
              localField: "_id",
              foreignField: "destination_id",
              as: "Place_to_visit"
            }
          }
        ];
      }

      const DestinationData = await DestinationSchema.aggregate(pipeline);

      if (DestinationData === null) {
        throw new NotFound("Destination Data Not Found");
      }
      for (let i = 0; i < DestinationData.length; i++) {
        for (let j = 0; j < DestinationData[i].Place_to_visit.length; j++) {
          DestinationData[i].Place_to_visit[j].photo = await image_url(fn, DestinationData[i].Place_to_visit[j].photo);
        }
      }
      return this.sendJSONResponse(
        res,
        "data retrived",
        {
          length: 1
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

  // async DestinationPhoto(req, res) {
  //   try {
  //     console.log("123");
  //     const id = req.query.category_id;

  //     const DestinationData = await DestinationSchema.aggregate([
  //       {
  //         $match: {
  //           $and: [{ destination_category_id: mongoose.Types.ObjectId(id) }, { status: true }]
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "place_to_visits",
  //           localField: "_id",
  //           foreignField: "destination_id",
  //           as: "Place_to_visit"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "packages",
  //           localField: "_id",
  //           foreignField: "destination",
  //           as: "Package",
  //           pipeline: [
  //             {
  //               $match: { status: true }
  //             },
  //             {
  //               $sort: {
  //                 price_per_person: 1
  //               }
  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           destination_name: 1,
  //           how_to_reach: 1,
  //           about_destination: 1,
  //           best_time_for_visit: 1,
  //           Place_to_visit: 1,
  //           Package: {
  //             price_per_person: 1,
  //             price_and_date: 1,
  //             total_days: 1,
  //             total_nights: 1,
  //             // package_valid_till_for_booking: 1
  //           }
  //         }
  //       }
  //     ]);

  //     const finalData = [];
  //     const currentDate = new Date();

  //     for (let i = 0; i < DestinationData.length; i++) {

  //       if (DestinationData[i].Package) {
  //         for (let j = 0; j < DestinationData[i].Package.length; j++) {
  //           const package1 = DestinationData[i].Package[j];
  //           console.log(package1)

  //           if (package1.price_and_date && package1.price_and_date.length > 0) {
  //             let priceFound = false;
  //             for (let k = 0; k < package1.price_and_date.length; k++) {
  //               const priceEntry = package1.price_and_date[k];
  //               const startDate = new Date(priceEntry.price_start_date);
  //               const endDate = new Date(priceEntry.price_end_date);

  //               if (currentDate >= startDate && currentDate <= endDate) {
  //                 package1.price_per_person = priceEntry.price_per_person;
  //                 priceFound = true;
  //                 break;
  //               }
  //             }
  //             if (!priceFound && package1.price_and_date[0]) {
  //               package1.price_per_person = package1.price_and_date[0].price_per_person;
  //             } else if (!priceFound) {
  //               console.log("abc")
  //               package1.price_per_person = package1.price_and_date[0].price_per_person;;
  //             }
  //           } else {
  //             console.log("123")
  //             // console.log("123", DestinationData[0].Package[0].price_per_person)
  //             package1.price_per_person = package1.price_per_person || DestinationData[0].Package[0].price_per_person
  //           }
  //         }
  //       }

  //       const element = DestinationData[i];
  //       for (let j = 0; j < element.Place_to_visit.length; j++) {
  //         const p = element.Place_to_visit[j];
  //         p.photo = await image_url(fn, p.photo);
  //       }

  //       if (element.Package[0].price_per_person) {
  //         finalData.push({
  //           _id: element._id,
  //           destination_name: element.destination_name,
  //           Place_to_visit: element.Place_to_visit[0].photo,
  //           Package: element.Package[0].price_per_person,
  //           best_time_for_visit: element.best_time_for_visit,
  //           total_days: element.Package[0].total_days,
  //           total_nights: element.Package[0].total_nights,
  //         });
  //       }
  //     }

  //     if (DestinationData === null) {
  //       throw new NotFound("Destination Data Not Found");
  //     }
  //     return this.sendJSONResponse(
  //       res,
  //       "data retrived",
  //       {
  //         length: 1
  //       },
  //       finalData
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  // async DestinationPhoto(req, res) {
  //   try {
  //     const id = req.query.category_id;
  //     const currentDate = new Date();

  //     // Fetch destination and package details
  //     const DestinationData = await DestinationSchema.aggregate([
  //       {
  //         $match: {
  //           $and: [{ destination_category_id: mongoose.Types.ObjectId(id) }, { status: true }]
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "place_to_visits",
  //           localField: "_id",
  //           foreignField: "destination_id",
  //           as: "Place_to_visit"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "packages",
  //           localField: "_id",
  //           foreignField: "destination",
  //           as: "Package",
  //           pipeline: [{ $match: { status: true } }]
  //         }
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           destination_name: 1,
  //           how_to_reach: 1,
  //           about_destination: 1,
  //           best_time_for_visit: 1,
  //           Place_to_visit: 1,
  //           Package: {
  //             price_and_date: 1,
  //             total_days: 1,
  //             total_nights: 1
  //           }
  //         }
  //       }
  //     ]);

  //     const destinationReviews = await ReviewSchema.aggregate([
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
  //           path: "$package_info",
  //           preserveNullAndEmptyArrays: true
  //         }
  //       },
  //       {
  //         $group: {
  //           _id: "$package_info.destination", // Group by destination_id
  //           total_reviews: { $sum: 1 }, // Total number of reviews
  //           total_rating: { $sum: "$star_numeric" } // Sum of all ratings
  //         }
  //       },
  //       {
  //         $project: {
  //           destination_id: "$_id",
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

  //     const reviewMap = {};
  //     destinationReviews.forEach((review) => {
  //       reviewMap[review.destination_id.toString()] = review;
  //     });

  //     // 3️⃣ Inject avg_rating into DestinationData
  //     DestinationData.forEach((destination) => {
  //       const reviewData = reviewMap[destination._id.toString()] || { avg_rating: 0, total_reviews: 0 };
  //       destination.avg_rating = reviewData.avg_rating;
  //       destination.total_reviews = reviewData.total_reviews;
  //     });

  //     const finalData = [];

  //     const packageProfitMargins = await package_profit_margin.find();

  //     // for (let i = 0; i < DestinationData.length; i++) {
  //     //   if (DestinationData[i].Packages) {
  //     //     DestinationData[i].Packages = DestinationData[i].Packages.filter((package1) => {
  //     //       if (package1.price_and_date && package1.price_and_date.length > 0) {
  //     //         if (!startDateFilter) {
  //     //           return package1.price_and_date.some((priceEntry) => {
  //     //             const endDate = new Date(priceEntry.price_end_date);
  //     //             const endDateWithoutTime = new Date(endDate.toDateString());
  //     //             const currentDateWithoutTime = new Date(currentDate.toDateString());

  //     //             // Exclude package if its end date is in the past
  //     //             if (endDate <= currentDateWithoutTime) {
  //     //               return false;
  //     //             }
  //     //             return true;
  //     //           });
  //     //         }

  //     //         return package1.price_and_date.some((priceEntry) => {
  //     //           const startDate = new Date(priceEntry.price_start_date);
  //     //           const endDate = new Date(priceEntry.price_end_date);

  //     //           const endDateWithoutTime = new Date(endDate.toDateString());
  //     //           const currentDateWithoutTime = new Date(currentDate.toDateString());

  //     //           if (endDate <= currentDateWithoutTime) {
  //     //             return false;
  //     //           }
  //     //           // return endDateWithoutTime >= currentDateWithoutTime;

  //     //           // Check if the package's date range overlaps with the filter range
  //     //           return (
  //     //             (startDate >= startDateFilter && startDate <= startDateFilter) ||
  //     //             (endDate >= startDateFilter && endDate <= startDateFilter) ||
  //     //             (startDate <= startDateFilter && endDate >= startDateFilter)
  //     //           );
  //     //         });
  //     //       }
  //     //       return false; // Exclude packages without valid price_and_date
  //     //     });
  //     //   }
  //     // }

  //     for (let i = 0; i < DestinationData.length; i++) {
  //       if (DestinationData[i].Package) {
  //         DestinationData[i].Package = DestinationData[i].Package.filter((package1) => {
  //           if (package1.price_and_date && package1.price_and_date.length > 0) {
  //             return package1.price_and_date.some((priceEntry) => {
  //               const endDate = new Date(priceEntry.price_end_date);
  //               const currentDateWithoutTime = new Date(currentDate.toDateString());

  //               // ✅ **If end date is before today, remove package**
  //               return endDate >= currentDateWithoutTime;
  //             });
  //           }
  //           return false; // Exclude packages without valid price_and_date
  //         });
  //       }
  //     }

  //     for (let i = 0; i < DestinationData.length; i++) {
  //       let minPriceAcrossPackages = null;
  //       let selectedPackage = null;
  //       let selectedMonth = null;

  //       if (DestinationData[i].Package) {
  //         for (let j = 0; j < DestinationData[i].Package.length; j++) {
  //           const package1 = DestinationData[i].Package[j];
  //           let minPrice = null;

  //           // Find the minimum price within the package based on the current date
  //           if (package1.price_and_date && package1.price_and_date.length > 0) {
  //             for (let k = 0; k < package1.price_and_date.length; k++) {
  //               const priceEntry = package1.price_and_date[k];
  //               const startDate = new Date(priceEntry.price_start_date);
  //               // console.log("Start Date:", startDate);
  //               const endDate = new Date(priceEntry.price_end_date);
  //               const startMonth = startDate.toLocaleString("default", { month: "long" });
  //               // Check if the current date is within the range
  //               if (currentDate >= startDate && currentDate <= endDate) {
  //                 if (minPrice === null || priceEntry.price_per_person < minPrice) {
  //                   minPrice = priceEntry.price_per_person;
  //                   selectedMonth = startMonth;
  //                 }
  //               }
  //             }

  //             // Fallback to the first price if no price matches the date range
  //             if (minPrice === null && package1.price_and_date.length > 0) {
  //               minPrice = package1.price_and_date[0].price_per_person;
  //             }
  //           }

  //           // Compare the current package's min price with the overall min price
  //           if (minPrice !== null && (minPriceAcrossPackages === null || minPrice < minPriceAcrossPackages)) {
  //             minPriceAcrossPackages = minPrice;
  //             selectedPackage = package1; // Track the package with the lowest price
  //             console.log(selectedMonth)

  //           }
  //         }
  //       }

  //       const element = DestinationData[i];

  //       const profitMargin = packageProfitMargins.find((margin) => margin.state_name === element.destination_name);

  //       let adminMarginPercentage = 10; // Default margin

  //       if (profitMargin && selectedMonth) {
  //         const monthMargin = profitMargin.month_and_margin_user.find(
  //           (margin) => margin.month_name.toLowerCase() === selectedMonth.toLowerCase()
  //         );

  //         if (monthMargin) {
  //           adminMarginPercentage = monthMargin.margin_percentage;
  //         }
  //       }

  //       // Update the photo URL for each place to visit
  //       for (let j = 0; j < element.Place_to_visit.length; j++) {
  //         const p = element.Place_to_visit[j];
  //         p.photo = await image_url(fn, p.photo); // Assuming `image_url` is a helper to modify photo URL
  //       }

  //       // Ensure the lowest price package is added to the final data
  //       if (selectedPackage && minPriceAcrossPackages !== null) {
  //         const adjustedPrice = minPriceAcrossPackages + (minPriceAcrossPackages * adminMarginPercentage) / 100;

  //         finalData.push({
  //           _id: element._id,
  //           destination_name: element.destination_name,
  //           Place_to_visit: element.Place_to_visit[0].photo, // Display only the first place's photo
  //           Package: Math.round(adjustedPrice), // Display the lowest price
  //           best_time_for_visit: element.best_time_for_visit,
  //           total_days: selectedPackage.total_days,
  //           total_nights: selectedPackage.total_nights,
  //           avg_rating: element.avg_rating, // Injected average rating
  //           total_reviews: element.total_reviews,
  //           adminMarginPercentage, // Show applied margin for reference
  //           selectedMonth
  //         });
  //       }
  //     }

  //     // If no data is found
  //     if (finalData.length === 0) {
  //       throw new NotFound("Destination Data Not Found");
  //     }

  //     // Return the final response
  //     return this.sendJSONResponse(res, "Data retrieved", { length: finalData.length }, finalData);
  //   } catch (error) {
  //     // Handle errors properly
  //     if (error instanceof NotFound) {
  //       console.log(error.message);
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async DestinationPhoto(req, res) {
    try {
      const id = req.query.category_id;
      const currentDate = new Date();

      // Fetch destination and package details
      const DestinationData = await DestinationSchema.aggregate([
        {
          $match: {
            $and: [{ destination_category_id: mongoose.Types.ObjectId(id) }, { status: true }]
          }
        },
        {
          $lookup: {
            from: "place_to_visits",
            localField: "_id",
            foreignField: "destination_id",
            as: "Place_to_visit"
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
            how_to_reach: 1,
            about_destination: 1,
            best_time_for_visit: 1,
            Place_to_visit: 1,
            Package: {
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

      console.log(destinationReviews);

      const reviewMap = {};
      destinationReviews.forEach((review) => {
        const key = review.destination_id?.toString(); // ✅ Prevent null crash
        if (key) {
          reviewMap[key] = review;
        }
      });

      // 3️⃣ Inject avg_rating into DestinationData
      DestinationData.forEach((destination) => {
        const reviewData = reviewMap[destination._id.toString()] || { avg_rating: 0, total_reviews: 0 };
        destination.avg_rating = Number(reviewData.avg_rating.toFixed(1));
        destination.total_reviews = reviewData.total_reviews;
      });

      const finalData = [];

      const packageProfitMargins = await package_profit_margin.find();

      for (let i = 0; i < DestinationData.length; i++) {
        if (DestinationData[i].Package) {
          DestinationData[i].Package = DestinationData[i].Package.filter((package1) => {
            if (package1.price_and_date && package1.price_and_date.length > 0) {
              return package1.price_and_date.some((priceEntry) => {
                const endDate = new Date(priceEntry.price_end_date);
                const currentDateWithoutTime = new Date(currentDate.toDateString());

                // ✅ **If end date is before today, remove package**
                return endDate >= currentDateWithoutTime;
              });
            }
            return false; // Exclude packages without valid price_and_date
          });
        }
      }

      // Helper function to find minimum price and details
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

      // Function to calculate admin margin
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

      // Main price processing logic
      for (let i = 0; i < DestinationData.length; i++) {
        let minPriceAcrossPackages = null;
        let selectedPackage = null;
        let finalSelectedMonth = null;

        if (DestinationData[i].Package) {
          for (const package1 of DestinationData[i].Package) {
            const { minPrice, selectedMonth, selectedStartDate } = findMinimumPriceDetails(package1, currentDate);

            if (minPrice !== null && (minPriceAcrossPackages === null || minPrice < minPriceAcrossPackages)) {
              minPriceAcrossPackages = minPrice;
              selectedPackage = package1;
              finalSelectedMonth = selectedMonth;
            }
          }

          const element = DestinationData[i];

          // Calculate admin margin
          const adminMarginPercentage = calculateAdminMargin(
            element.destination_name,
            finalSelectedMonth,
            packageProfitMargins
          );

          for (let j = 0; j < element.Place_to_visit.length; j++) {
            const p = element.Place_to_visit[j];
            p.photo = await image_url(fn, p.photo); // Assuming `image_url` is a helper to modify photo URL
          }

          // Calculate final price with margin
          if (selectedPackage && minPriceAcrossPackages !== null) {
            const adjustedPrice = minPriceAcrossPackages + (minPriceAcrossPackages * adminMarginPercentage) / 100;

            finalData.push({
              _id: element._id,
              destination_name: element.destination_name,
              Place_to_visit: element.Place_to_visit[0].photo,
              Package: Math.round(adjustedPrice),
              best_time_for_visit: element.best_time_for_visit,
              total_days: selectedPackage.total_days,
              total_nights: selectedPackage.total_nights,
              avg_rating: element.avg_rating,
              total_reviews: element.total_reviews,
              adminMarginPercentage,
              selectedMonth: finalSelectedMonth
            });
          }
        }
      }

      // If no data is found
      if (finalData.length === 0) {
        throw new NotFound("Destination Data Not Found");
      }

      // Return the final response
      return this.sendJSONResponse(res, "Data retrieved", { length: finalData.length }, finalData);
    } catch (error) {
      // Handle errors properly
      if (error instanceof NotFound) {
        console.log(error.message);
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async updateDestinationCategory(req, res) {
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
      const destId = req.params.id;
      const data = {
        destination_category_id: req.body?.destination_category_id,
        destination_name: req.body.destination_name,
        how_to_reach: req.body.how_to_reach,
        about_destination: req.body.about_destination,
        best_time_for_visit: req.body.best_time_for_visit
      };
      const destinationData = await DestinationSchema.findByIdAndUpdate(destId, data, { new: true });
      return this.sendJSONResponse(res, "", {}, destinationData);
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async DeleteDestination(req, res) {
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
      const updatedData = await DestinationSchema.findByIdAndUpdate({ _id: id }, { status: 0 }, { new: true });
      return this.sendJSONResponse(
        res,
        "Destination deleted",
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

  async GetDestination(req, res) {
    try {
      let package_margin = await package_profit_margin.find();
      const destination_id = req.query.destination_id;
      const currentDate = new Date();

      const startDateFilter = req.query.start_date ? new Date(req.query.start_date) : null;

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
      const currentMonthName = monthNames[currentDate.getMonth()];

      const destinationDetails = await DestinationSchema.aggregate([
        {
          $match: {
            $and: [{ status: true }, { _id: mongoose.Types.ObjectId(destination_id) }]
          }
        },
        {
          $lookup: {
            from: "packages",
            localField: "_id",
            foreignField: "destination",
            as: "Packages",
            pipeline: [
              { $match: { status: true } },
              {
                $lookup: {
                  from: "destinations",
                  localField: "destination",
                  foreignField: "_id",
                  as: "destinations"
                }
              },
              {
                $lookup: {
                  from: "itineries",
                  localField: "destination",
                  foreignField: "package_id",
                  as: "itineries_details"
                }
              },
              { $unwind: "$destinations" },
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
          $lookup: {
            from: "place_to_visits",
            localField: "_id",
            foreignField: "destination_id",
            as: "Place_to_Visit"
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
          $group: {
            _id: "$book_package_id",
            total_reviews: { $sum: 1 }, // Total number of reviews
            total_rating: { $sum: "$star_numeric" }, // Sum of all ratings
            rating_count: { $sum: { $cond: [{ $gt: ["$star_numeric", 0] }, 1, 0] } } // Count only valid ratings
          }
        },
        {
          $lookup: {
            from: "book_packages",
            localField: "_id",
            foreignField: "_id",
            as: "packageDetails"
          }
        },
        {
          $unwind: {
            path: "$packageDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "packages",
            localField: "packageDetails.package_id",
            foreignField: "_id",
            as: "packageInfo"
          }
        },
        {
          $unwind: {
            path: "$packageInfo",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            "packageInfo._id": { $ne: null }
          }
        },
        {
          $project: {
            package_id: "$packageInfo._id",
            package_name: "$packageInfo.name",
            total_reviews: 1,
            rating_count: 1, // Number of valid ratings
            total_rating: 1, // Sum of all ratings
            avg_rating: {
              $cond: {
                if: { $gt: ["$rating_count", 0] }, // If there are valid ratings
                then: { $divide: ["$total_rating", "$rating_count"] }, // Compute average
                else: 0 // Otherwise, set 0
              }
            }
          }
        }
      ]);

      // Filter Packages based on the provided date range
      for (let i = 0; i < destinationDetails.length; i++) {
        if (destinationDetails[i].Packages) {
          destinationDetails[i].Packages = destinationDetails[i].Packages.filter((package1) => {
            if (package1.price_and_date && package1.price_and_date.length > 0) {
              if (!startDateFilter) {
                return package1.price_and_date.some((priceEntry) => {
                  const endDate = new Date(priceEntry.price_end_date);
                  const endDateWithoutTime = new Date(endDate.toDateString());
                  const currentDateWithoutTime = new Date(currentDate.toDateString());

                  // Exclude package if its end date is in the past
                  if (endDate <= currentDateWithoutTime) {
                    return false;
                  }
                  return true;
                });
              }

              return package1.price_and_date.some((priceEntry) => {
                const startDate = new Date(priceEntry.price_start_date);
                const endDate = new Date(priceEntry.price_end_date);

                const endDateWithoutTime = new Date(endDate.toDateString());
                const currentDateWithoutTime = new Date(currentDate.toDateString());

                if (endDate <= currentDateWithoutTime) {
                  return false;
                }
                // return endDateWithoutTime >= currentDateWithoutTime;

                // Check if the package's date range overlaps with the filter range
                return (
                  (startDate >= startDateFilter && startDate <= startDateFilter) ||
                  (endDate >= startDateFilter && endDate <= startDateFilter) ||
                  (startDate <= startDateFilter && endDate >= startDateFilter)
                );
              });
            }
            return false; // Exclude packages without valid price_and_date
          });
        }
      }

      // Process Packages to maintain the original response structure
      for (let i = 0; i < destinationDetails.length; i++) {
        if (destinationDetails[i].Packages) {
          for (let j = 0; j < destinationDetails[i].Packages.length; j++) {
            const package1 = destinationDetails[i].Packages[j];

            // Update photo URL for place
            if (package1.Place && package1.Place[0] && package1.Place[0].photo) {
              package1.Place[0].photo = await image_url(fn, package1.Place[0].photo);
            }

            // Find the nearest start date from price_and_date
            let nearestStartDate = null;
            let nearestPriceEntry = null;
            console.log(nearestStartDate);

            if (package1.price_and_date && package1.price_and_date.length > 0) {
              let priceFound = false;
              for (let k = 0; k < package1.price_and_date.length; k++) {
                const priceEntry = package1.price_and_date[k];
                const startDate = new Date(priceEntry.price_start_date);
                const endDate = new Date(priceEntry.price_end_date);

                console.log("Checking Start Date:", startDate);

                if (!nearestStartDate || startDate < nearestStartDate) {
                  nearestStartDate = startDate;
                  nearestPriceEntry = priceEntry;
                }

                if (currentDate >= startDate && currentDate <= endDate) {
                  package1.price_per_person = priceEntry.price_per_person;
                  priceFound = true;
                  break;
                }
              }

              // If no price is found, set the nearest one
              if (!priceFound && nearestPriceEntry) {
                package1.price_per_person = nearestPriceEntry.price_per_person;
              }
            }

            // Ensure nearestStartDate is defined before using it
            if (nearestStartDate) {
              const currentMonthName = monthNames[nearestStartDate.getMonth()];

              const filteredProfitMargin = package_margin
                .filter((state) => state.state_name === destinationDetails[i].destination_name)
                .map((state) => ({
                  state_name: state.state_name,
                  month_and_margin_user: state.month_and_margin_user.filter(
                    (margin) => margin.month_name === currentMonthName
                  )
                }));

              let marginPercentage = 10;

              if (filteredProfitMargin.length > 0 && filteredProfitMargin[0].month_and_margin_user.length > 0) {
                marginPercentage = parseFloat(filteredProfitMargin[0].month_and_margin_user[0].margin_percentage);
              }

              const finalPrice = package1.price_per_person + package1.price_per_person * (marginPercentage / 100);
              package1.price_per_person = Math.round(finalPrice);

              if (j === 0 || package1.price_per_person < destinationDetails[i].Package_price) {
                destinationDetails[i].Package_price = package1.price_per_person;
              }
            }
          }

          for (let j = 0; j < destinationDetails[i].Place_to_Visit.length; j++) {
            destinationDetails[i].Place_to_Visit[j].photo = await image_url(
              fn,
              destinationDetails[i].Place_to_Visit[j].photo
            );
          }
        }
      }

      const data = destinationDetails.map((detail) => ({
        _id: detail._id,
        destination_name: detail.destination_name,
        how_to_reach: detail.how_to_reach,
        about_destination: detail.about_destination,
        best_time_for_visit: detail.best_time_for_visit,
        photo: detail.Place_to_Visit[0]?.photo,
        Package_price: detail.Package_price
      }));

      const placeToVisit = destinationDetails[0].Place_to_Visit;
      let Package = destinationDetails[0].Packages;
      Package.forEach((element) => {
        element.hotel_type = element.hotel_type[0];
        element.Place = element.Place[0].photo;
        element.days = element.total_days + "D/" + element.total_nights + "N";
        delete element["total_days"];
        delete element["total_nights"];
      });
      Package.forEach((element) => {
        element.meal_required = element.meal_required[0];
      });

      const reviewMap = {};
      packageReviews.forEach((review) => {
        if (review.package_id) {
          reviewMap[review.package_id.toString()] = review;
        }
      });

      // Inject avg_rating into Packages
      destinationDetails.forEach((destination) => {
        if (destination.Packages) {
          destination.Packages.forEach((pkg) => {
            const reviewData = reviewMap[pkg._id.toString()] || { avg_rating: 0, total_reviews: 0 };
            pkg.avg_rating = reviewData.avg_rating;
            pkg.total_reviews = reviewData.total_reviews;
          });
        }
      });

      const final_result = [
        {
          destination: data[0],
          Packages: Package,
          Place_to_Visit: placeToVisit
        }
      ];

      return this.sendJSONResponse(res, "Destinations have been retrieved", { length: 1 }, final_result);
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error);
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async GetDestination(req, res) {
  //   try {
  //     let package_margin = await package_profit_margin.find();
  //     const destination_id = req.query.destination_id;
  //     const currentDate = new Date();
  //     const monthNames = [
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
  //     const currentMonthName = monthNames[currentDate.getMonth()];

  //     const destinationDetails = await DestinationSchema.aggregate([
  //       {
  //         $match: {
  //           $and: [{ status: true }, { _id: mongoose.Types.ObjectId(destination_id) }]
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "packages",
  //           localField: "_id",
  //           foreignField: "destination",
  //           as: "Packages",
  //           pipeline: [
  //             {
  //               $match: { status: true }
  //             },
  //             {
  //               $lookup: {
  //                 from: "destinations",
  //                 localField: "destination",
  //                 foreignField: "_id",
  //                 as: "destinations"
  //               }
  //             },
  //             {
  //               $lookup: {
  //                 from: "itineries",
  //                 localField: "destination",
  //                 foreignField: "package_id",
  //                 as: "itineries_details"
  //               }
  //             },
  //             {
  //               $unwind: "$destinations"
  //             },
  //             {
  //               $lookup: {
  //                 from: "place_to_visits",
  //                 localField: "place_to_visit_id",
  //                 foreignField: "_id",
  //                 as: "Place"
  //               }
  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "place_to_visits",
  //           localField: "_id",
  //           foreignField: "destination_id",
  //           as: "Place_to_Visit"
  //         }
  //       }
  //     ]);

  //     for (let i = 0; i < destinationDetails.length; i++) {
  //       if (destinationDetails[i].Packages) {
  //         // Filter out packages with expired prices (end date <= current date)
  //         destinationDetails[i].Packages = destinationDetails[i].Packages.filter((package1) => {
  //           if (package1.price_and_date && package1.price_and_date.length > 0) {
  //             return package1.price_and_date.some((priceEntry) => {
  //               const endDate = new Date(priceEntry.price_end_date);

  //               // Ignore the time part of both dates
  //               const endDateWithoutTime = new Date(endDate.toDateString());
  //               const currentDateWithoutTime = new Date(currentDate.toDateString());

  //               // Compare only the date part (ignoring time)
  //               return endDateWithoutTime >= currentDateWithoutTime;
  //             });
  //           }
  //           return false; // Exclude packages without any valid price_and_date
  //         });

  //         for (let j = 0; j < destinationDetails[i].Packages.length; j++) {
  //           const package1 = destinationDetails[i].Packages[j];

  //           // Update photo URL for place
  //           if (package1.Place && package1.Place[0] && package1.Place[0].photo) {
  //             package1.Place[0].photo = await image_url(fn, package1.Place[0].photo);
  //           }

  //           // Get price_per_person based on current date
  //           if (package1.price_and_date && package1.price_and_date.length > 0) {
  //             let priceFound = false;
  //             for (let k = 0; k < package1.price_and_date.length; k++) {
  //               const priceEntry = package1.price_and_date[k];
  //               const startDate = new Date(priceEntry.price_start_date);
  //               const endDate = new Date(priceEntry.price_end_date);

  //               if (currentDate >= startDate && currentDate <= endDate) {
  //                 package1.price_per_person = priceEntry.price_per_person;
  //                 priceFound = true;
  //                 break;
  //               }
  //             }
  //             if (!priceFound && package1.price_and_date[0]) {
  //               package1.price_per_person = package1.price_and_date[0].price_per_person;
  //             }
  //           }

  //           // Attach the filteredProfitMargin to each package object
  //           const filteredProfitMargin = package_margin
  //             .filter((state) => state.state_name === destinationDetails[i].destination_name)
  //             .map((state) => ({
  //               state_name: state.state_name,
  //               month_and_margin_user: state.month_and_margin_user.filter(
  //                 (margin) => margin.month_name === currentMonthName
  //               )
  //             }));

  //           let marginPercentage = 10;

  //           // Check if filteredProfitMargin is not empty and has a valid month_and_margin_user
  //           if (filteredProfitMargin.length > 0 && filteredProfitMargin[0].month_and_margin_user.length > 0) {
  //             marginPercentage = parseFloat(filteredProfitMargin[0].month_and_margin_user[0].margin_percentage);
  //           }

  //           // Calculate the final price by adding the margin percentage
  //           const finalPrice = package1.price_per_person + package1.price_per_person * (marginPercentage / 100);
  //           package1.price_per_person = Math.round(finalPrice); // Round the price

  //           // Calculate the final price by adding the margin percentage
  //           // if (filteredProfitMargin.length > 0 && filteredProfitMargin[0].month_and_margin_user.length > 0) {
  //           //   const marginPercentage = parseFloat(filteredProfitMargin[0].month_and_margin_user[0].margin_percentage);
  //           //   const finalPrice = package1.price_per_person + (package1.price_per_person * (marginPercentage / 100));
  //           //   package1.price_per_person = Math.round(finalPrice); // Round the price
  //           // }

  //           // Update the Package_price for the destination
  //           if (j === 0 || package1.price_per_person < destinationDetails[i].Package_price) {
  //             destinationDetails[i].Package_price = package1.price_per_person;
  //           }
  //         }

  //         // Update photos for Place_to_Visit
  //         for (let j = 0; j < destinationDetails[i].Place_to_Visit.length; j++) {
  //           destinationDetails[i].Place_to_Visit[j].photo = await image_url(
  //             fn,
  //             destinationDetails[i].Place_to_Visit[j].photo
  //           );
  //         }
  //       }
  //     }

  //     // Prepare the final response
  //     const data = destinationDetails.map((detail) => ({
  //       _id: detail._id,
  //       destination_name: detail.destination_name,
  //       how_to_reach: detail.how_to_reach,
  //       about_destination: detail.about_destination,
  //       best_time_for_visit: detail.best_time_for_visit,
  //       photo: detail.Place_to_Visit[0]?.photo,
  //       Package_price: detail.Package_price
  //     }));

  //     const placeToVisit = destinationDetails[0].Place_to_Visit;
  //     let Package = destinationDetails[0].Packages;
  //     Package.forEach((element) => {
  //       element.hotel_type = element.hotel_type[0];
  //       element.Place = element.Place[0].photo;
  //       element.days = element.total_days + "D/" + element.total_nights + "N";
  //       delete element["total_days"];
  //       delete element["total_nights"];
  //     });
  //     Package.forEach((element) => {
  //       element.meal_required = element.meal_required[0];
  //     });

  //     const final_result = [
  //       {
  //         destination: data[0],
  //         Packages: Package,
  //         Place_to_Visit: placeToVisit
  //       }
  //     ];

  //     return this.sendJSONResponse(res, "destinations have been retrieved", { length: 1 }, final_result);
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error);
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async Displaymostloveddestination(req, res) {
    try {
      const tokenData = req.userData;
      const adminData = await userSchema.find({ _id: tokenData.id });
      if (adminData.length === 0) {
        throw new Forbidden("you are not user");
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
        // Displaymostlovaeddestionation[i].place_to_visits[0].photo = generateDownloadLink(
        //   Displaymostlovaeddestionation[i].place_to_visits[0].photo,
        //   req.localHostURL
        // );
        Displaymostlovaeddestionation[i].place_to_visits[0].photo = await image_url(
          fn,
          Displaymostlovaeddestionation[i].place_to_visits[0].photo
        );
        // Displaymostlovaeddestionation[i].place_to_visits = generateFileDownloadLinkPrefix(req.localHostURL);
        // Displaymostlovaeddestionation[i].place_to_visits[0].photo;
      }
      return this.sendJSONResponse(
        res,
        "Display mostloved destionaton",
        {
          length: 1
        },
        Displaymostlovaeddestionation
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
