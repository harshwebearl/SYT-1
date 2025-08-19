const multer = require("multer");
const hotel_model = require("../models/hotel_syt_schema");
const room_syt_schema = require("../models/room_syt_schema");
const property_policies_schema = require("../models/property_policies_schema");
const amenities_and_facilities_schema = require("../models/amenities_and_facilities_syt_model");
const fs = require("fs");
const BaseController = require("./BaseController");
const NotFound = require("../errors/NotFound");
const Forbidden = require("../errors/Forbidden");
const userSchema = require("../models/usersSchema");
const mongoose = require("mongoose");
const image_url = require("../update_url_path.js");
const hotel_booking_syt_Schema = require("../models/hotel_booking_syt_schema");
const room_syt = require("../models/room_syt_schema.js");
const package_profit_margin = require("../models/package_profit_margin.js");
const Notificationschema = require("../models/NotificationSchema.js");
const { getReceiverSocketId, io } = require("../socket/socket.js");
const fn = "hotel_syt";

module.exports = class hotel_controller extends BaseController {
  // async hotel_register(req, res) {
  //   try {
  //     const tokenData = req.userData;
  //     if (tokenData === "") {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }
  //     const userData = await userSchema.find({ _id: tokenData.id });

  //     if (userData[0].role !== "admin" && userData[0].role !== "agency") {
  //       throw new Forbidden("you are not admin or agency");
  //     }

  //     if (hotel_name) {
  //       return res.status(403).json({
  //         success: false,
  //         message: "Hotel Name Allready Exits"
  //       })
  //     }

  //     // if (city) {
  //     //   return res.status(403).json({
  //     //     success: false,
  //     //     message: "City Allready Exits"
  //     //   })
  //     // }

  //     // if (state) {
  //     //   return res.status(403).json({
  //     //     success: false,
  //     //     message: "Hotel Name All Ready Exits"
  //     //   })
  //     // }

  //     const hotel_register = {
  //       user_id: tokenData.id,
  //       hotel_name: req.body.hotel_name,
  //       hotel_address: req.body.hotel_address,
  //       hotel_description: req.body.hotel_description,
  //       hotel_highlights: req.body.hotel_highlights,
  //       city: req.body.city,
  //       hotel_type: req.body.hotel_type,
  //       state: req.body.state,
  //       other: req.body.other,
  //       // uploadFilesPath: req.files.map((file) => file.filename)
  //       hotel_photo: req.files.map((file) => file.filename)
  //     };
  //     const new_hotel_register = new hotel_model(hotel_register);
  //     const data = await new_hotel_register.save();
  //     if (hotel_register.length == 0) {
  //       throw new Forbidden("hotel_register not saved! Please insert again");
  //     }
  //     return this.sendJSONResponse(
  //       res,
  //       "hotel_register Added Successfully!",
  //       {
  //         length: 1
  //       },
  //       data
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async hotel_register(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({ message: "Auth fail" });
      }

      const userData = await userSchema.findOne({ _id: tokenData.id });
      if (userData.role !== "admin" && userData.role !== "agency") {
        return res.status(403).json({ message: "You are not authorized" });
      }

      const { hotel_name, city, state } = req.body;

      // Check if a hotel with the same name, city, and state already exists
      const existingHotel = await hotel_model.findOne({
        hotel_name,
        city,
        state
      });

      if (existingHotel) {
        return res.status(403).json({
          success: false,
          message: "Hotel already exists"
        });
      }

      const hotel_register = {
        user_id: tokenData.id,
        hotel_name,
        hotel_address: req.body.hotel_address,
        hotel_description: req.body.hotel_description,
        hotel_highlights: req.body.hotel_highlights,
        city,
        hotel_type: req.body.hotel_type,
        state,
        other: req.body.other,
        hotel_photo: req.files.map((file) => file.filename),
        breakfast_price: req.body.breakfast_price,
        lunch_price: req.body.lunch_price,
        dinner_price: req.body.dinner_price,
        lunch: req.body.lunch,
        dinner: req.body.dinner,
        breakfast: req.body.breakfast
      };

      const new_hotel_register = new hotel_model(hotel_register);
      const data = await new_hotel_register.save();

      if (userData.role === "agency") {
        const agencyNotification = await Notificationschema.create({
          user_id: tokenData.id,
          title: "Hotel Registered Successfully",
          text: `Your hotel "${hotel_name}" has been successfully registered! It will be reviewed and approved by the admin.`,
          user_type: "agency"
        });

        const adminSocketId = getReceiverSocketId(tokenData.id);
        if (adminSocketId) {
          io.to(adminSocketId).emit("newNotification", agencyNotification);
        }
      } else if (userData.role === "admin") {
        const adminNotification = await Notificationschema.create({
          user_id: tokenData.id,
          title: "New Hotel Registered",
          text: `A new hotel "${hotel_name}" has been added. Please review the hotel details for approval.`,
          user_type: "admin"
        });

        const adminSocketId = getReceiverSocketId(tokenData.id);
        if (adminSocketId) {
          io.to(adminSocketId).emit("newNotification", adminNotification);
        }
      }
      return this.sendJSONResponse(res, "Hotel registered successfully!", { length: 1 }, data);
    } catch (error) {
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async get_hotel_register(req, res) {
  //   try {
  //     const tokenData = req.userData;
  //     if (tokenData === "") {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }
  //     const userData = await userSchema.find({ _id: tokenData.id });

  //     if (userData[0].role !== "admin" && userData[0].role !== "agency" && userData[0].role !== "customer") {
  //       throw new Forbidden("you are not admin or agency or customer");
  //     }

  //     let hotel;
  //     if (userData[0].role === "customer") {
  //       hotel = await hotel_model.aggregate([
  //         {
  //           $match: {
  //             status: "active"
  //           }
  //         },
  //         {
  //           $lookup: {
  //             from: 'hotel_review_schemas',
  //             localField: '_id',
  //             foreignField: 'book_hotel_id',
  //             as: 'hotel_review'
  //           }
  //         },
  //         {
  //           $lookup: {
  //             from: 'room_syts',
  //             localField: '_id',
  //             foreignField: 'hotel_id',
  //             as: 'room',
  //             pipeline: [
  //               {
  //                 $lookup: {
  //                   from: "room_prices",
  //                   localField: "_id",
  //                   foreignField: "room_id",
  //                   as: "room_price",
  //                   pipeline: [
  //                     // { $unwind: "$price_and_date" },
  //                     {
  //                       $unwind: {
  //                         path: "$price_and_date",
  //                         preserveNullAndEmptyArrays: true
  //                       }
  //                     },
  //                     {
  //                       $group: {
  //                         _id: "$room_id",
  //                         price_and_date: { $push: "$price_and_date" },
  //                         othere_future_agency: { $first: "$othere_future_agency" }
  //                       }
  //                     }
  //                   ]
  //                 }
  //               },
  //               {
  //                 $addFields: {
  //                   price_and_date: { $arrayElemAt: ["$room_price.price_and_date", 0] },
  //                   othere_future_agency: { $arrayElemAt: ["$room_price.othere_future_agency", 0] }
  //                 }
  //               },
  //               {
  //                 $unset: "room_price" // Remove the room_price field from the final response
  //               }
  //             ]
  //           }
  //         },
  //         // {
  //         //   $addFields: {
  //         //     min_room_price: { $min: "$room.price" }
  //         //   }
  //         // },
  //         {
  //           $addFields: {
  //             min_room_price: {
  //               $min: {
  //                 $map: {
  //                   input: "$room",
  //                   as: "room",
  //                   in: {
  //                     $min: {
  //                       $map: {
  //                         input: "$$room.price_and_date",
  //                         as: "price",
  //                         in: "$$price.adult_price"
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         },
  //         {
  //           $project: {
  //             _id: 1,
  //             user_id: 1,
  //             hotel_name: 1,
  //             hotel_address: 1,
  //             hotel_description: 1,
  //             hotel_highlights: 1,
  //             city: 1,
  //             hotel_type: 1,
  //             state: 1,
  //             other: 1,
  //             hotel_photo: 1,
  //             status: 1,
  //             // room: 1,
  //             min_room_price: 1,
  //             // hotel_review: 1,
  //             hotel_review: { $arrayElemAt: ["$hotel_review.star", 0] }

  //           }
  //         }
  //       ]);
  //     } else if (userData[0].role === "agency") {
  //       hotel = await hotel_model.find({ user_id: mongoose.Types.ObjectId(tokenData.id) });
  //     } else if (userData[0].role === "admin") {
  //       hotel = await hotel_model.aggregate([
  //         {
  //           $lookup: {
  //             from: 'users',
  //             localField: 'user_id',
  //             foreignField: '_id',
  //             as: 'user_details',
  //             pipeline: [
  //               {
  //                 $project: {
  //                   _id: 1,
  //                   role: 1,
  //                 }
  //               }
  //             ]
  //           }
  //         },
  //       ])
  //     }

  //     if (hotel.length == 0) {
  //       throw new Forbidden("get hotel Error In Database");
  //     }
  //     for (let i = 0; i < hotel.length; i++) {
  //       for (let j = 0; j < hotel[i].hotel_photo.length; j++) {
  //         hotel[i].hotel_photo[j] = await image_url(fn, hotel[i].hotel_photo[j]);
  //       }

  //       for (let j = 0; j < hotel[0].rooms.length; j++) {
  //         // Check if the current date is between start_date and end_date
  //         // const startDate = new Date(result[0].rooms[j].start_date);
  //         // const endDate = new Date(result[0].rooms[j].end_date);

  //         // if (currentDate >= startDate && currentDate <= endDate) {
  //         //   result[0].rooms[j].status = result[0].rooms[j].status;
  //         // } else if (currentDate < startDate) {
  //         //   result[0].rooms[j].status = "sold out";
  //         // } else {
  //         //   result[0].rooms[j].status = "sold out";
  //         // }
  //         const currentDate = new Date();
  //         let priceFound = false;

  //         if (result[0].rooms[j].price_and_date && result[0].rooms[j].price_and_date.length > 0) {
  //           for (let i = 0; i < result[0].rooms[j].price_and_date.length; i++) {
  //             const priceStartDate = new Date(result[0].rooms[j].price_and_date[i].price_start_date);
  //             console.log("priceStartDate ::", priceStartDate)
  //             const priceEndDate = new Date(result[0].rooms[j].price_and_date[i].price_end_date);
  //             console.log("priceEndDate ::", priceEndDate)

  //             if (currentDate >= priceStartDate && currentDate <= priceEndDate) {
  //               // const vender_price_per_person = result[0].rooms[j].price_per_person
  //               result[0].rooms[j].price = result[0].rooms[j].price_and_date[i].adult_price;
  //               priceFound = true;
  //               break;
  //             }
  //           }

  //           if (!priceFound) {
  //             result[0].rooms[j].price = result[0].rooms[j].price_and_date[0].adult_price;
  //           }
  //         }

  //         for (let k = 0; k < result[0].rooms[j].photos.length; k++) {
  //           result[0].rooms[j].photos[k] = await image_url("room_syt", result[0].rooms[j].photos[k]);
  //         }
  //       }

  //       for (let j = 0; j < result[0].Highlights.length; j++) {
  //         result[0].Highlights[j].icon = await image_url("highlights", result[0].Highlights[j].icon);
  //       }

  //       for (let i = 0; i < result[0].hotel_reviews.length; i++) {
  //         const review = result[0].hotel_reviews[i];
  //         if (review.user_details && review.user_details.photo) {
  //           review.user_details.photo = await image_url("user_photos", review.user_details.photo);
  //         }
  //       }

  //       const defaultMonths = [
  //         "January", "February", "March", "April", "May", "June",
  //         "July", "August", "September", "October", "November", "December"
  //       ];

  //       // Extract destination_name from the package data
  //       const destinationName = result[0].state;

  //       console.log(destinationName)

  //       // Find if this destination exists in the profit margin data
  //       const matchedProfitMargin = packageProfitMargin.find(
  //         state => state.state_name === destinationName
  //       );

  //       // If a match is found, use the matched profit margin
  //       if (matchedProfitMargin) {
  //         result[0].profitMargin = [{
  //           state_name: matchedProfitMargin.state_name,
  //           month_and_margin_user: matchedProfitMargin.month_and_margin_user
  //         }];
  //       } else {
  //         // If no match is found, create a new profit margin with admin_margin 0 for all months
  //         result[0].profitMargin = [{
  //           state_name: destinationName,
  //           month_and_margin_user: defaultMonths.map(month => ({
  //             month_name: month,
  //             admin_margin: 0
  //           }))
  //         }];
  //       }
  //     }
  //     return this.sendJSONResponse(
  //       res,
  //       "get_hotel Successfully!",
  //       {
  //         length: 1
  //       },
  //       hotel
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  // async get_hotel_register(req, res) {
  //   try {
  //     const tokenData = req.userData;
  //     if (tokenData === "") {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }
  //     const userData = await userSchema.find({ _id: tokenData.id });

  //     if (userData[0].role !== "admin" && userData[0].role !== "agency" && userData[0].role !== "customer") {
  //       throw new Forbidden("you are not admin or agency or customer");
  //     }
  //     const packageProfitMargin = await package_profit_margin.find();

  //     let hotel;
  //     if (userData[0].role === "customer") {
  //       hotel = await hotel_model.aggregate([
  //         {
  //           $match: {
  //             status: "active"
  //           }
  //         },
  //         {
  //           $lookup: {
  //             from: 'hotel_review_schemas',
  //             localField: '_id',
  //             foreignField: 'book_hotel_id',
  //             as: 'hotel_review'
  //           }
  //         },
  //         {
  //           $lookup: {
  //             from: 'room_syts',
  //             localField: '_id',
  //             foreignField: 'hotel_id',
  //             as: 'room',
  //             pipeline: [
  //               {
  //                 $lookup: {
  //                   from: "room_prices",
  //                   localField: "_id",
  //                   foreignField: "room_id",
  //                   as: "room_price",
  //                   pipeline: [
  //                     {
  //                       $unwind: {
  //                         path: "$price_and_date",
  //                         preserveNullAndEmptyArrays: true
  //                       }
  //                     },
  //                     {
  //                       $group: {
  //                         _id: "$room_id",
  //                         price_and_date: { $push: "$price_and_date" },
  //                         othere_future_agency: { $first: "$othere_future_agency" }
  //                       }
  //                     }
  //                   ]
  //                 }
  //               },
  //               {
  //                 $addFields: {
  //                   price_and_date: { $arrayElemAt: ["$room_price.price_and_date", 0] },
  //                   othere_future_agency: { $arrayElemAt: ["$room_price.othere_future_agency", 0] }
  //                 }
  //               },
  //               {
  //                 $unset: "room_price"
  //               }
  //             ]
  //           }
  //         },
  //         {
  //           $addFields: {
  //             min_room_price: {
  //               $min: {
  //                 $map: {
  //                   input: "$room",
  //                   as: "room",
  //                   in: {
  //                     $min: {
  //                       $map: {
  //                         input: "$$room.price_and_date",
  //                         as: "price",
  //                         in: "$$price.adult_price"
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         },
  //         {
  //           $project: {
  //             _id: 1,
  //             user_id: 1,
  //             hotel_name: 1,
  //             hotel_address: 1,
  //             hotel_description: 1,
  //             hotel_highlights: 1,
  //             city: 1,
  //             hotel_type: 1,
  //             state: 1,
  //             other: 1,
  //             hotel_photo: 1,
  //             status: 1,
  //             min_room_price: 1,
  //             hotel_review: { $arrayElemAt: ["$hotel_review.star", 0] }
  //           }
  //         }
  //       ]);
  //     } else if (userData[0].role === "agency") {
  //       hotel = await hotel_model.find({ user_id: mongoose.Types.ObjectId(tokenData.id) });
  //     } else if (userData[0].role === "admin") {
  //       hotel = await hotel_model.aggregate([
  //         {
  //           $lookup: {
  //             from: 'users',
  //             localField: 'user_id',
  //             foreignField: '_id',
  //             as: 'user_details',
  //             pipeline: [
  //               {
  //                 $project: {
  //                   _id: 1,
  //                   role: 1,
  //                 }
  //               }
  //             ]
  //           }
  //         },
  //       ]);
  //     }

  //     if (hotel.length == 0) {
  //       throw new Forbidden("get hotel Error In Database");
  //     }

  //     // Processing each hotel entry
  //     for (let i = 0; i < hotel.length; i++) {
  //       // Process hotel photos
  //       for (let j = 0; j < hotel[i].hotel_photo.length; j++) {
  //           hotel[i].hotel_photo[j] = await image_url(fn, hotel[i].hotel_photo[j]);
  //       }

  //       const defaultMonths = [
  //           "January", "February", "March", "April", "May", "June",
  //           "July", "August", "September", "October", "November", "December"
  //       ];

  //       const destinationName = hotel[i].state;

  //       // Find if this destination exists in the profit margin data
  //       const matchedProfitMargin = packageProfitMargin.find(
  //           state => state.state_name === destinationName
  //       );

  //       // Get the current month name
  //       const currentMonthIndex = new Date().getMonth(); // 0-11 for Jan-Dec
  //       const currentMonthName = defaultMonths[currentMonthIndex];

  //       // Initialize min room price
  //       let minRoomPrice = hotel[i].min_room_price;

  //       // If a match is found, calculate profit margin
  //       if (matchedProfitMargin) {
  //           const currentMonthMargin = matchedProfitMargin.month_and_margin_user.find(monthMargin => monthMargin.month_name === currentMonthName);
  //           const marginPercentage = currentMonthMargin ? currentMonthMargin.margin_percentage : 0;

  //           // Adjust the minimum room price based on the margin
  //           if (marginPercentage > 0) {
  //               minRoomPrice = minRoomPrice + (minRoomPrice * (marginPercentage / 100));
  //           }
  //           hotel[i].profitMargin = [{
  //               state_name: matchedProfitMargin.state_name,
  //               margin_percentage: marginPercentage, // Use the found margin
  //           }];
  //       } else {
  //           // No match found
  //           hotel[i].profitMargin = [{
  //               state_name: destinationName,
  //               margin_percentage: 0 // Since no profit margin data exists, set to 0
  //           }];
  //       }

  //       // Set the adjusted minimum room price in the hotel object
  //       hotel[i].min_room_price = minRoomPrice; // Update min_room_price with the adjusted value
  //   }

  //     return this.sendJSONResponse(
  //       res,
  //       "get_hotel Successfully!",
  //       {
  //         length: hotel.length
  //       },
  //       hotel
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async get_hotel_register(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({ message: "Auth fail" });
      }

      const userData = await userSchema.find({ _id: tokenData.id });

      if (!["admin", "agency", "customer"].includes(userData[0].role)) {
        throw new Forbidden("You are not admin, agency, or customer");
      }

      console.log(userData[0].role);

      const packageProfitMargin = await package_profit_margin.find();

      let hotel;
      if (userData[0].role === "customer") {
        hotel = await hotel_model.aggregate([
          {
            $match: { status: "active" }
          },
          {
            $lookup: {
              from: "hotel_review_schemas",
              localField: "_id",
              foreignField: "book_hotel_id",
              as: "hotel_review"
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
            $addFields: {
              min_room_price: {
                $min: {
                  $map: {
                    input: "$room",
                    as: "room",
                    in: {
                      $min: {
                        $map: {
                          input: "$$room.price_and_date",
                          as: "price",
                          in: "$$price.adult_price"
                        }
                      }
                    }
                  }
                }
              }
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
              breakfast_price: 1,
              lunch_price: 1,
              dinner_price: 1,
              breakfast: 1,
              lunch: 1,
              dinner: 1,
              room: 1,
              hotel_review: { $arrayElemAt: ["$hotel_review.star", 0] }
            }
          }
        ]);
        for (let i = 0; i < hotel.length; i++) {
          // for (let j = 0; j < hotel[i].hotel_photo.length; j++) {
          //   hotel[i].hotel_photo[j] = await image_url(fn, hotel[i].hotel_photo[j]);
          // }

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

          const destinationName = hotel[i].state;
          const matchedProfitMargin = packageProfitMargin.find((state) => state.state_name === destinationName);

          let minRoomPrice = hotel[i].min_room_price;
          let marginPercentage = "10";

          if (hotel[i].room.length > 0 && hotel[i].room[0].price_and_date) {
            const startDate = new Date(hotel[i].room[0].price_and_date[0].price_start_date);
            const startMonthName = defaultMonths[startDate.getMonth()];

            if (matchedProfitMargin) {
              const currentMonthMargin = matchedProfitMargin.month_and_margin_user.find(
                (monthMargin) => monthMargin.month_name === startMonthName
              );
              marginPercentage = currentMonthMargin ? currentMonthMargin.margin_percentage : "10";

              if (marginPercentage > 0) {
                minRoomPrice += minRoomPrice * (marginPercentage / 100);
              }
            }
          }

          hotel[i].profitMargin = [
            {
              state_name: destinationName,
              margin_percentage: marginPercentage
            }
          ];
          hotel[i].min_room_price = minRoomPrice;
        }
      } else if (userData[0].role === "agency") {
        hotel = await hotel_model.find({ user_id: mongoose.Types.ObjectId(tokenData.id) });
      } else if (userData[0].role === "admin") {
        hotel = await hotel_model.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user_details",
              pipeline: [{ $project: { _id: 1, role: 1 } }]
            }
          }
        ]);
      }

      if (hotel.length === 0) {
        throw new Forbidden("get hotel Error In Database");
      }

      for (let i = 0; i < hotel.length; i++) {
        for (let j = 0; j < hotel[i].hotel_photo.length; j++) {
          hotel[i].hotel_photo[j] = await image_url(fn, hotel[i].hotel_photo[j]);
        }

        // const defaultMonths = [
        //   "January", "February", "March", "April", "May", "June",
        //   "July", "August", "September", "October", "November", "December"
        // ];

        // const destinationName = hotel[i].state;
        // const matchedProfitMargin = packageProfitMargin.find(
        //   state => state.state_name === destinationName
        // );

        // let minRoomPrice = hotel[i].min_room_price;
        // let marginPercentage = 0;

        // if (hotel[i].room.length > 0 && hotel[i].room[0].price_and_date) {
        //   const startDate = new Date(hotel[i].room[0].price_and_date[0].price_start_date);
        //   const startMonthName = defaultMonths[startDate.getMonth()];

        //   if (matchedProfitMargin) {
        //     const currentMonthMargin = matchedProfitMargin.month_and_margin_user.find(
        //       monthMargin => monthMargin.month_name === startMonthName
        //     );
        //     marginPercentage = currentMonthMargin ? currentMonthMargin.margin_percentage : 0;

        //     if (marginPercentage > 0) {
        //       minRoomPrice += minRoomPrice * (marginPercentage / 100);
        //     }
        //   }
        // }

        // hotel[i].profitMargin = [{
        //   state_name: destinationName,
        //   margin_percentage: marginPercentage
        // }];
        // hotel[i].min_room_price = minRoomPrice;
      }

      return this.sendJSONResponse(res, "get_hotel Successfully!", { length: hotel.length }, hotel);
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async get_all_hotel_by_user(req, res) {
    try {
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
            hotel_review: { $arrayElemAt: ["$hotel_review.star", 0] }
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

      return this.sendJSONResponse(res, "get_hotel Successfully!", { length: hotel.length }, hotel);
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async get_all_hotel_by_user(req, res) {
  //   try {
  //     const packageProfitMargin = await package_profit_margin.find();

  //     let hotel = await hotel_model.aggregate([
  //       {
  //         $match: { status: "active" }
  //       },
  //       {
  //         $lookup: {
  //           from: "hotel_review_schemas",
  //           localField: "_id",
  //           foreignField: "book_hotel_id",
  //           as: "hotel_review"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "room_syts",
  //           localField: "_id",
  //           foreignField: "hotel_id",
  //           as: "room",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "room_prices",
  //                 localField: "_id",
  //                 foreignField: "room_id",
  //                 as: "room_price",
  //                 pipeline: [
  //                   { $unwind: "$price_and_date" },
  //                   {
  //                     $group: {
  //                       _id: "$room_id",
  //                       price_and_date: { $push: "$price_and_date" },
  //                       othere_future_agency: { $first: "$othere_future_agency" }
  //                     }
  //                   }
  //                 ]
  //               }
  //             },
  //             {
  //               $addFields: {
  //                 price_and_date: { $arrayElemAt: ["$room_price.price_and_date", 0] },
  //                 othere_future_agency: { $arrayElemAt: ["$room_price.othere_future_agency", 0] }
  //               }
  //             },
  //             { $unset: "room_price" }
  //           ]
  //         }
  //       },
  //       {
  //         $addFields: {
  //           min_room_price: {
  //             $min: {
  //               $map: {
  //                 input: "$room",
  //                 as: "room",
  //                 in: {
  //                   $min: {
  //                     $map: {
  //                       input: "$$room.price_and_date",
  //                       as: "price",
  //                       in: "$$price.adult_price"
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           user_id: 1,
  //           hotel_name: 1,
  //           hotel_address: 1,
  //           hotel_description: 1,
  //           hotel_highlights: 1,
  //           city: 1,
  //           hotel_type: 1,
  //           state: 1,
  //           other: 1,
  //           hotel_photo: 1,
  //           status: 1,
  //           min_room_price: 1,
  //           room: 1,
  //           hotel_review: { $arrayElemAt: ["$hotel_review.star", 0] }
  //         }
  //       }
  //     ]);

  //     for (let i = 0; i < hotel.length; i++) {
  //       for (let j = 0; j < hotel[i].hotel_photo.length; j++) {
  //         hotel[i].hotel_photo[j] = await image_url(fn, hotel[i].hotel_photo[j]);
  //       }

  //       const defaultMonths = [
  //         "January",
  //         "February",
  //         "March",
  //         "April",
  //         "May",
  //         "June",
  //         "July",
  //         "August",
  //         "September",
  //         "October",
  //         "November",
  //         "December"
  //       ];

  //       const destinationName = hotel[i].state;
  //       const matchedProfitMargin = packageProfitMargin.find((state) => state.state_name === destinationName);

  //       let minRoomPrice = hotel[i].min_room_price;
  //       let marginPercentage = "10";

  //       if (hotel[i].room.length > 0) {
  //         const currentDate = new Date();

  //         // Loop through each room to find valid `price_and_date`
  //         for (const room of hotel[i].room) {
  //           const priceAndDateEntry = room.price_and_date.find(
  //             (priceDate) =>
  //               new Date(priceDate.price_start_date) <= currentDate && new Date(priceDate.price_end_date) >= currentDate
  //           );

  //           if (priceAndDateEntry) {
  //             const startDate = new Date(priceAndDateEntry.price_start_date);
  //             const startMonthName = defaultMonths[startDate.getMonth()];

  //             if (matchedProfitMargin) {
  //               const currentMonthMargin = matchedProfitMargin.month_and_margin_user.find(
  //                 (monthMargin) => monthMargin.month_name === startMonthName
  //               );
  //               marginPercentage = currentMonthMargin ? currentMonthMargin.margin_percentage : "10";

  //               if (marginPercentage > 0) {
  //                 minRoomPrice += minRoomPrice * (marginPercentage / 100);
  //               }
  //             }

  //             // Stop after finding the first valid price_and_date entry
  //             break;
  //           }
  //         }
  //       }

  //       hotel[i].profitMargin = [
  //         {
  //           state_name: destinationName,
  //           margin_percentage: marginPercentage
  //         }
  //       ];
  //       hotel[i].min_room_price = Math.round(minRoomPrice);
  //     }

  //     return this.sendJSONResponse(res, "get_hotel Successfully!", { length: hotel.length }, hotel);
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async get_all_hotel_data(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency" && userData[0].role !== "customer") {
        throw new Forbidden("you are not admin or agency or customer");
      }

      let result;
      if (userData[0].role === "customer") {
        result = await hotel_model.aggregate([
          {
            $match: { status: "active" }
          },
          {
            $lookup: {
              from: "room_syts",
              localField: "_id",
              foreignField: "hotel_id",
              as: "rooms"
            }
          }
        ]);
      } else if (userData[0].role === "agency") {
        result = await hotel_model.aggregate([
          {
            $match: { user_id: mongoose.Types.ObjectId(tokenData.id) }
          },
          {
            $lookup: {
              from: "room_syts",
              localField: "_id",
              foreignField: "hotel_id",
              as: "rooms"
            }
          }
        ]);
      } else if (userData[0].role === "admin") {
        result = await hotel_model.aggregate([
          {
            $lookup: {
              from: "room_syts",
              localField: "_id",
              foreignField: "hotel_id",
              as: "rooms"
            }
          }
        ]);
      }
      //   const hotel_id = req.query._id;
      // const result = await hotel_model.aggregate([
      //   {
      //     $lookup: {
      //       from: "room_syts",
      //       localField: "_id",
      //       foreignField: "hotel_id",
      //       as: "rooms"
      //     }
      //   }
      // ]);
      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].hotel_photo.length; j++) {
          result[i].hotel_photo[j] = await image_url("hotel_syt", result[i].hotel_photo[j]);
        }
        for (let j = 0; j < result[i].rooms.length; j++) {
          for (let k = 0; k < result[i].rooms[j].photos.length; k++) {
            result[i].rooms[j].photos[k] = await image_url("room_syt", result[i].rooms[j].photos[k]);
          }
        }
      }
      return this.sendJSONResponse(
        res,
        "get_hotel Successfully!",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async get_hotel_by_id_data(req, res) {
  //   try {
  //     const hotel_id = req.query._id;
  //     const tokenData = req.userData;
  //     if (tokenData === "") {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }
  //     const result = await hotel_model.aggregate([
  //       {
  //         $match: { _id: mongoose.Types.ObjectId(hotel_id) }
  //       },
  //       {
  //         $lookup: {
  //           from: "room_syts",
  //           localField: "_id",
  //           foreignField: "hotel_id",
  //           as: "rooms"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "amenities_and_facilities",
  //           localField: "_id",
  //           foreignField: "hotel_id",
  //           as: "amenities_and_facilities"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "highlights",
  //           localField: "hotel_highlights",
  //           foreignField: "_id",
  //           as: "Highlights"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "property_policies",
  //           localField: "_id",
  //           foreignField: "hotel_id",
  //           as: "property_policies"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "hotel_review_schemas",
  //           localField: "book_hotel_id",
  //           foreignField: "hotel_id",
  //           as: "hotel_reviews"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "customers",
  //           localField: "hotel_reviews.user_id",
  //           foreignField: "_id",
  //           as: "user_details"
  //         }
  //       },
  //     ]);

  //     // if (result.length == 0) {
  //     //   throw new Forbidden(" room not get ! please insert again");
  //     // }
  //     for (let j = 0; j < result[0].hotel_photo.length; j++) {
  //       result[0].hotel_photo[j] = await image_url("hotel_syt", result[0].hotel_photo[j]);
  //     }
  //     for (let j = 0; j < result[0].rooms.length; j++) {
  //       for (let k = 0; k < result[0].rooms[j].photos.length; k++) {
  //         result[0].rooms[j].photos[k] = await image_url("room_syt", result[0].rooms[j].photos[k]);
  //       }
  //     }

  //     for (let j = 0; j < result[0].Highlights.length; j++) {
  //       result[0].Highlights[j].icon = await image_url("highlights", result[0].Highlights[j].icon);
  //     }

  //     return this.sendJSONResponse(
  //       res,
  //       "Hotel Details fetched Succesfully!",
  //       {
  //         length: 1
  //       },
  //       result
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  // async get_hotel_by_id_data(req, res) {
  //   try {
  //     const hotel_id = req.query._id;
  //     const tokenData = req.userData;
  //     if (!tokenData) {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }
  //     const result = await hotel_model.aggregate([
  //       {
  //         $match: { _id: mongoose.Types.ObjectId(hotel_id) }
  //       },
  //       {
  //         $lookup: {
  //           from: "room_syts",
  //           localField: "_id",
  //           foreignField: "hotel_id",
  //           as: "rooms"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "amenities_and_facilities",
  //           localField: "_id",
  //           foreignField: "hotel_id",
  //           as: "amenities_and_facilities"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "highlights",
  //           localField: "hotel_highlights",
  //           foreignField: "_id",
  //           as: "Highlights"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "property_policies",
  //           localField: "_id",
  //           foreignField: "hotel_id",
  //           as: "property_policies"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "hotel_review_schemas",
  //           localField: "_id",
  //           foreignField: "book_hotel_id", //hotel_id
  //           as: "hotel_reviews"
  //         }
  //       },
  //       {
  //         $unwind: {
  //           path: "$hotel_reviews",
  //           preserveNullAndEmptyArrays: true
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "customers",
  //           localField: "hotel_reviews.user_id",
  //           foreignField: "user_id",
  //           as: "user_details"
  //         }
  //       },

  //       {
  //         $group: {
  //           _id: "$_id",
  //           hotel_name: { $first: "$hotel_name" },
  //           hotel_address: { $first: "$hotel_address" },
  //           hotel_photo: { $first: "$hotel_photo" },
  //           hotel_description: { $first: "$hotel_description" },
  //           hotel_status: { $first: "$status" },
  //           hotel_type: { $first: "$hotel_type" },
  //           city: { $first: "$city" },
  //           state: { $first: "$state" },
  //           other: { $first: "$other" },
  //           rooms: { $first: "$rooms" },
  //           amenities_and_facilities: { $first: "$amenities_and_facilities" },
  //           Highlights: { $first: "$Highlights" },
  //           property_policies: { $first: "$property_policies" },
  //           hotel_reviews: {
  //             $push: {
  //               _id: "$hotel_reviews._id",
  //               user_id: "$hotel_reviews.user_id",
  //               star: "$hotel_reviews.star",
  //               comment_box: "$hotel_reviews.comment_box",
  //               createdAt: "$hotel_reviews.createdAt",
  //               updatedAt: "$hotel_reviews.updatedAt",
  //               user_details: { $arrayElemAt: ["$user_details", 0] }
  //             }
  //           }
  //         }
  //       }
  //     ]);

  //     // Ensure the result exists
  //     if (result.length === 0) {
  //       throw new Forbidden("Hotel not found");
  //     }

  //     const currentDate = new Date();

  //     // Process photos and other details
  //     for (let j = 0; j < result[0].hotel_photo.length; j++) {
  //       result[0].hotel_photo[j] = await image_url("hotel_syt", result[0].hotel_photo[j]);
  //     }

  //     for (let j = 0; j < result[0].rooms.length; j++) {
  //       // Check if the current date is between start_date and end_date
  //       const startDate = new Date(result[0].rooms[j].start_date);
  //       const endDate = new Date(result[0].rooms[j].end_date);

  //       if (currentDate >= startDate && currentDate <= endDate) {
  //         result[0].rooms[j].status = result[0].rooms[j].status;
  //       } else if (currentDate < startDate) {
  //         result[0].rooms[j].status = "sold out";
  //       } else {
  //         result[0].rooms[j].status = "sold out";
  //       }

  //       for (let k = 0; k < result[0].rooms[j].photos.length; k++) {
  //         result[0].rooms[j].photos[k] = await image_url("room_syt", result[0].rooms[j].photos[k]);
  //       }
  //     }

  //     for (let j = 0; j < result[0].Highlights.length; j++) {
  //       result[0].Highlights[j].icon = await image_url("highlights", result[0].Highlights[j].icon);
  //     }

  //     for (let i = 0; i < result[0].hotel_reviews.length; i++) {
  //       const review = result[0].hotel_reviews[i];
  //       if (review.user_details && review.user_details.photo) {
  //         review.user_details.photo = await image_url("user_photos", review.user_details.photo);
  //       }
  //     }

  //     return this.sendJSONResponse(
  //       res,
  //       "Hotel Details fetched Successfully!",
  //       {
  //         length: result.length
  //       },
  //       result
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async all_hotel_display_agency(req, res) {
    try {
      let result = await hotel_model.find({ status: "active" });

      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].hotel_photo.length; j++) {
          result[i].hotel_photo[j] = await image_url("hotel_syt", result[i].hotel_photo[j]);
        }
      }

      return this.sendJSONResponse(
        res,
        "get_hotel Successfully!",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async get_hotel_by_id_data(req, res) {
  //   try {
  //     const hotel_id = req.query._id;
  //     const packageProfitMargin = await package_profit_margin.find();

  //     const tokenData = req.userData;
  //     if (!tokenData) {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }
  //     const result = await hotel_model.aggregate([
  //       {
  //         $match: { _id: mongoose.Types.ObjectId(hotel_id) }
  //       },
  //       {
  //         $lookup: {
  //           from: "room_syts",
  //           localField: "_id",
  //           foreignField: "hotel_id",
  //           as: "rooms",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "room_prices",
  //                 localField: "_id",
  //                 foreignField: "room_id",
  //                 as: "room_price",
  //                 pipeline: [
  //                   // { $unwind: "$price_and_date" },
  //                   {
  //                     $unwind: {
  //                       path: "$price_and_date",
  //                       preserveNullAndEmptyArrays: true
  //                     }
  //                   },
  //                   {
  //                     $group: {
  //                       _id: "$room_id",
  //                       price_and_date: { $push: "$price_and_date" },
  //                       othere_future_agency: { $first: "$othere_future_agency" }
  //                     }
  //                   }
  //                 ]
  //               }
  //             },
  //             {
  //               $addFields: {
  //                 price_and_date: { $arrayElemAt: ["$room_price.price_and_date", 0] },
  //                 othere_future_agency: { $arrayElemAt: ["$room_price.othere_future_agency", 0] }
  //               }
  //             },
  //             {
  //               $unset: "room_price" // Remove the room_price field from the final response
  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "amenities_and_facilities",
  //           localField: "_id",
  //           foreignField: "hotel_id",
  //           as: "amenities_and_facilities"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "highlights",
  //           localField: "hotel_highlights",
  //           foreignField: "_id",
  //           as: "Highlights"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "property_policies",
  //           localField: "_id",
  //           foreignField: "hotel_id",
  //           as: "property_policies"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "hotel_review_schemas",
  //           localField: "_id",
  //           foreignField: "book_hotel_id", //hotel_id
  //           as: "hotel_reviews",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "customers",
  //                 localField: "user_id",
  //                 foreignField: "user_id",
  //                 as: "user_details"
  //               }
  //             },
  //             {
  //               $unwind: {
  //                 path: "$user_details",
  //                 preserveNullAndEmptyArrays: true
  //               }
  //             }
  //           ]
  //         }
  //       },
  //       // {
  //       //   $unwind: {
  //       //     path: "$hotel_reviews",
  //       //     preserveNullAndEmptyArrays: true
  //       //   }
  //       // },
  //       // {
  //       //   $lookup: {
  //       //     from: "customers",
  //       //     localField: "hotel_reviews.user_id",
  //       //     foreignField: "user_id",
  //       //     as: "user_details"
  //       //   }
  //       // },

  //       {
  //         $group: {
  //           _id: "$_id",
  //           hotel_name: { $first: "$hotel_name" },
  //           hotel_address: { $first: "$hotel_address" },
  //           hotel_photo: { $first: "$hotel_photo" },
  //           hotel_description: { $first: "$hotel_description" },
  //           hotel_type: { $first: "$hotel_type" },
  //           city: { $first: "$city" },
  //           state: { $first: "$state" },
  //           breakfast_price: { $first: "$breakfast_price" },
  //           lunch_price: { $first: "$lunch_price" },
  //           dinner_price: { $first: "$dinner_price" },
  //           breakfast: { $first: "$breakfast" },
  //           lunch: { $first: "$lunch" },
  //           dinner: { $first: "$dinner" },
  //           other: { $first: "$other" },
  //           hotel_status: { $first: "$status" },
  //           rooms: { $first: "$rooms" },
  //           amenities_and_facilities: { $first: "$amenities_and_facilities" },
  //           Highlights: { $first: "$Highlights" },
  //           property_policies: { $first: "$property_policies" },
  //           hotel_reviews: { $first: "$hotel_reviews" }
  //           // hotel_reviews: {
  //           //   $push: {
  //           //     _id: "$hotel_reviews._id",
  //           //     user_id: "$hotel_reviews.user_id",
  //           //     star: "$hotel_reviews.star",
  //           //     comment_box: "$hotel_reviews.comment_box",
  //           //     createdAt: "$hotel_reviews.createdAt",
  //           //     updatedAt: "$hotel_reviews.updatedAt",
  //           //     user_details: { $arrayElemAt: ["$user_details", 0] }
  //           //   }
  //           // }
  //         }
  //       }
  //     ]);

  //     // Ensure the result exists
  //     if (result.length === 0) {
  //       throw new Forbidden("Hotel not found");
  //     }

  //     // const currentDate = new Date();

  //     // Process photos and other details
  //     for (let j = 0; j < result[0].hotel_photo.length; j++) {
  //       result[0].hotel_photo[j] = await image_url("hotel_syt", result[0].hotel_photo[j]);
  //     }

  //     for (let j = 0; j < result[0].rooms.length; j++) {
  //       // Check if the current date is between start_date and end_date
  //       // const startDate = new Date(result[0].rooms[j].start_date);
  //       // const endDate = new Date(result[0].rooms[j].end_date);

  //       // if (currentDate >= startDate && currentDate <= endDate) {
  //       //   result[0].rooms[j].status = result[0].rooms[j].status;
  //       // } else if (currentDate < startDate) {
  //       //   result[0].rooms[j].status = "sold out";
  //       // } else {
  //       //   result[0].rooms[j].status = "sold out";
  //       // }
  //       const currentDate = new Date();
  //       let priceFound = false;

  //       if (result[0].rooms[j].price_and_date && result[0].rooms[j].price_and_date.length > 0) {
  //         for (let i = 0; i < result[0].rooms[j].price_and_date.length; i++) {
  //           const priceStartDate = new Date(result[0].rooms[j].price_and_date[i].price_start_date);
  //           console.log("priceStartDate ::", priceStartDate);
  //           const priceEndDate = new Date(result[0].rooms[j].price_and_date[i].price_end_date);
  //           console.log("priceEndDate ::", priceEndDate);

  //           if (currentDate >= priceStartDate && currentDate <= priceEndDate) {
  //             // const vender_price_per_person = result[0].rooms[j].price_per_person
  //             result[0].rooms[j].price = result[0].rooms[j].price_and_date[i].adult_price;
  //             priceFound = true;
  //             break;
  //           }
  //         }

  //         if (!priceFound) {
  //           result[0].rooms[j].price = result[0].rooms[j].price_and_date[0].adult_price;
  //         }
  //       }

  //       for (let k = 0; k < result[0].rooms[j].photos.length; k++) {
  //         result[0].rooms[j].photos[k] = await image_url("room_syt", result[0].rooms[j].photos[k]);
  //       }
  //     }

  //     for (let j = 0; j < result[0].Highlights.length; j++) {
  //       result[0].Highlights[j].icon = await image_url("highlights", result[0].Highlights[j].icon);
  //     }

  //     for (let i = 0; i < result[0].hotel_reviews.length; i++) {
  //       const review = result[0].hotel_reviews[i];
  //       if (review.user_details && review.user_details.photo) {
  //         review.user_details.photo = await image_url("user_photos", review.user_details.photo);
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
  //     const destinationName = result[0].state;

  //     console.log(destinationName);

  //     // Find if this destination exists in the profit margin data
  //     const matchedProfitMargin = packageProfitMargin.find((state) => state.state_name === destinationName);

  //     // If a match is found, use the matched profit margin
  //     if (matchedProfitMargin) {
  //       result[0].profitMargin = [
  //         {
  //           state_name: matchedProfitMargin.state_name,
  //           month_and_margin_user: matchedProfitMargin.month_and_margin_user
  //         }
  //       ];
  //     } else {
  //       // If no match is found, create a new profit margin with admin_margin 0 for all months
  //       result[0].profitMargin = [
  //         {
  //           state_name: destinationName,
  //           month_and_margin_user: defaultMonths.map((month) => ({
  //             month_name: month,
  //             margin_percentage: "10"
  //           }))
  //         }
  //       ];
  //     }

  //     return this.sendJSONResponse(
  //       res,
  //       "Hotel Details fetched Successfully!",
  //       {
  //         length: result.length
  //       },
  //       result
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async get_hotel_by_id_data(req, res) {
    try {
      const hotel_id = req.query._id;
      const packageProfitMargin = await package_profit_margin.find();

      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }

      const isAdminOrAgency = tokenData.role === "admin" || tokenData.role === "agency";

      const result = await hotel_model.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(hotel_id) }
        },
        {
          $lookup: {
            from: "room_syts",
            let: { hotelId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$hotel_id", "$$hotelId"] },
                      ...(isAdminOrAgency ? [] : [{ $eq: ["$status", "available"] }])
                    ]
                  }
                }
              },
              {
                $lookup: {
                  from: "room_prices",
                  localField: "_id",
                  foreignField: "room_id",
                  as: "room_price",
                  pipeline: [
                    {
                      $unwind: {
                        path: "$price_and_date",
                        preserveNullAndEmptyArrays: true
                      }
                    },
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
              {
                $unset: "room_price"
              }
            ],
            as: "rooms"
          }
        },
        {
          $lookup: {
            from: "amenities_and_facilities",
            localField: "_id",
            foreignField: "hotel_id",
            as: "amenities_and_facilities"
          }
        },
        {
          $lookup: {
            from: "highlights",
            localField: "hotel_highlights",
            foreignField: "_id",
            as: "Highlights"
          }
        },
        {
          $lookup: {
            from: "property_policies",
            localField: "_id",
            foreignField: "hotel_id",
            as: "property_policies"
          }
        },
        {
          $lookup: {
            from: "hotel_review_schemas",
            localField: "_id",
            foreignField: "book_hotel_id",
            as: "hotel_reviews",
            pipeline: [
              {
                $lookup: {
                  from: "customers",
                  localField: "user_id",
                  foreignField: "user_id",
                  as: "user_details"
                }
              },
              {
                $unwind: {
                  path: "$user_details",
                  preserveNullAndEmptyArrays: true
                }
              }
            ]
          }
        },
        {
          $group: {
            _id: "$_id",
            hotel_name: { $first: "$hotel_name" },
            hotel_address: { $first: "$hotel_address" },
            hotel_photo: { $first: "$hotel_photo" },
            hotel_description: { $first: "$hotel_description" },
            hotel_type: { $first: "$hotel_type" },
            city: { $first: "$city" },
            state: { $first: "$state" },
            breakfast_price: { $first: "$breakfast_price" },
            lunch_price: { $first: "$lunch_price" },
            dinner_price: { $first: "$dinner_price" },
            breakfast: { $first: "$breakfast" },
            lunch: { $first: "$lunch" },
            dinner: { $first: "$dinner" },
            other: { $first: "$other" },
            hotel_status: { $first: "$status" },
            rooms: { $first: "$rooms" },
            amenities_and_facilities: { $first: "$amenities_and_facilities" },
            Highlights: { $first: "$Highlights" },
            property_policies: { $first: "$property_policies" },
            hotel_reviews: { $first: "$hotel_reviews" }
          }
        }
      ]);

      if (result.length === 0) {
        throw new Forbidden("Hotel not found");
      }

      for (let j = 0; j < result[0].hotel_photo.length; j++) {
        result[0].hotel_photo[j] = await image_url("hotel_syt", result[0].hotel_photo[j]);
      }

      const currentMonthName = [
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
      ][new Date().getMonth()];

      const destinationName = result[0].state;
      const matchedProfitMargin = packageProfitMargin.find((state) => state.state_name === destinationName);
      let adminMargin = 10; // Default admin margin

      if (matchedProfitMargin) {
        result[0].profitMargin = [
          {
            state_name: matchedProfitMargin.state_name,
            month_and_margin_user: matchedProfitMargin.month_and_margin_user
          }
        ];
      } else {
        // If no match is found, create a new profit margin with admin_margin 0 for all months
        result[0].profitMargin = [
          {
            state_name: destinationName,
            month_and_margin_user: [{ month_name: currentMonthName, margin_percentage: "10" }]
          }
        ];
      }

      if (matchedProfitMargin) {
        const marginData = matchedProfitMargin.month_and_margin_user.find((m) => m.month_name === currentMonthName);
        if (marginData) {
          adminMargin = parseFloat(marginData.margin_percentage);
        }

        //     // Extract destination_name from the package data
        //     const destinationName = result[0].state;

        //     console.log(destinationName);

        //     // Find if this destination exists in the profit margin data
        //     const matchedProfitMargin = packageProfitMargin.find((state) => state.state_name === destinationName);

        //     // If a match is found, use the matched profit margin
        //     if (matchedProfitMargin) {
        //       result[0].profitMargin = [
        //         {
        //           state_name: matchedProfitMargin.state_name,
        //           month_and_margin_user: matchedProfitMargin.month_and_margin_user
        //         }
        //       ];
        //     } else {
        //       // If no match is found, create a new profit margin with admin_margin 0 for all months
        //       result[0].profitMargin = [
        //         {
        //           state_name: destinationName,
        //           month_and_margin_user: defaultMonths.map((month) => ({
        //             month_name: month,
        //             margin_percentage: "10"
        //           }))
        //         }
        //       ];
        //     }
      }

      let minRoomPrice = Infinity; // Initialize min price variable

      for (let j = 0; j < result[0].rooms.length; j++) {
        const currentDate = new Date();
        let priceFound = false;
        let roomPrice = null;

        if (result[0].rooms[j].price_and_date && result[0].rooms[j].price_and_date.length > 0) {
          for (let i = 0; i < result[0].rooms[j].price_and_date.length; i++) {
            const priceStartDate = new Date(result[0].rooms[j].price_and_date[i].price_start_date);
            const priceEndDate = new Date(result[0].rooms[j].price_and_date[i].price_end_date);

            if (currentDate >= priceStartDate && currentDate <= priceEndDate) {
              result[0].rooms[j].price = result[0].rooms[j].price_and_date[i].adult_price;
              priceFound = true;
              break;
            }
          }

          if (!priceFound) {
            result[0].rooms[j].price = result[0].rooms[j].price_and_date[0].adult_price;
          }
        }

        if (result[0].rooms[j].price !== null) {
          // Apply admin margin
          // result[0].rooms[j].price += ( result[0].rooms[j].price * adminMargin) / 100;

          // Track the minimum price for the "starting_from" key
          minRoomPrice = Math.min(minRoomPrice, result[0].rooms[j].price);

          // Assign the price to the room object
          result[0].rooms[j].price = Math.round(result[0].rooms[j].price);
        }

        // Apply admin margin
        result[0].rooms[j].price += (result[0].rooms[j].price * adminMargin) / 100;

        for (let k = 0; k < result[0].rooms[j].photos.length; k++) {
          result[0].rooms[j].photos[k] = await image_url("room_syt", result[0].rooms[j].photos[k]);
        }
      }

      result[0].starting_from =
        minRoomPrice === Infinity ? null : Math.round(minRoomPrice + (minRoomPrice * adminMargin) / 100);

      for (let j = 0; j < result[0].Highlights.length; j++) {
        result[0].Highlights[j].icon = await image_url("highlights", result[0].Highlights[j].icon);
      }

      for (let i = 0; i < result[0].hotel_reviews.length; i++) {
        const review = result[0].hotel_reviews[i];
        if (review.user_details && review.user_details.photo) {
          review.user_details.photo = await image_url("user_photos", review.user_details.photo);
        }
      }

      return this.sendJSONResponse(
        res,
        "Hotel Details fetched Successfully!",
        {
          length: result.length
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async get_hotel_by_id_data_agency(req, res) {
    try {
      const hotel_id = req.query._id;
      const packageProfitMargin = await package_profit_margin.find();

      // const tokenData = req.userData;
      // if (!tokenData) {
      //   return res.status(401).json({
      //     message: "Auth fail"
      //   });
      // }

      const result = await hotel_model.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(hotel_id) }
        },
        {
          $lookup: {
            from: "room_syts",
            localField: "_id",
            foreignField: "hotel_id",
            as: "rooms"
          }
        },
        {
          $lookup: {
            from: "amenities_and_facilities",
            localField: "_id",
            foreignField: "hotel_id",
            as: "amenities_and_facilities"
          }
        },
        {
          $lookup: {
            from: "highlights",
            localField: "hotel_highlights",
            foreignField: "_id",
            as: "Highlights"
          }
        },
        {
          $lookup: {
            from: "property_policies",
            localField: "_id",
            foreignField: "hotel_id",
            as: "property_policies"
          }
        },
        {
          $lookup: {
            from: "hotel_review_schemas",
            localField: "_id",
            foreignField: "book_hotel_id", //hotel_id
            as: "hotel_reviews"
          }
        },
        {
          $unwind: {
            path: "$hotel_reviews",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "customers",
            localField: "hotel_reviews.user_id",
            foreignField: "user_id",
            as: "user_details"
          }
        },

        {
          $group: {
            _id: "$_id",
            hotel_name: { $first: "$hotel_name" },
            hotel_address: { $first: "$hotel_address" },
            hotel_photo: { $first: "$hotel_photo" },
            hotel_description: { $first: "$hotel_description" },
            hotel_type: { $first: "$hotel_type" },
            city: { $first: "$city" },
            state: { $first: "$state" },
            other: { $first: "$other" },
            hotel_status: { $first: "$status" },
            rooms: { $first: "$rooms" },
            amenities_and_facilities: { $first: "$amenities_and_facilities" },
            Highlights: { $first: "$Highlights" },
            property_policies: { $first: "$property_policies" },
            breakfast_price: { $first: "$breakfast_price" },
            lunch_price: { $first: "$lunch_price" },
            dinner_price: { $first: "$dinner_price" },
            breakfast: { $first: "$breakfast" },
            lunch: { $first: "$lunch" },
            dinner: { $first: "$dinner" },
            hotel_reviews: {
              $push: {
                _id: "$hotel_reviews._id",
                user_id: "$hotel_reviews.user_id",
                star: "$hotel_reviews.star",
                comment_box: "$hotel_reviews.comment_box",
                createdAt: "$hotel_reviews.createdAt",
                updatedAt: "$hotel_reviews.updatedAt",
                user_details: { $arrayElemAt: ["$user_details", 0] }
              }
            }
          }
        }
      ]);

      // Ensure the result exists
      if (result.length === 0) {
        throw new Forbidden("Hotel not found");
      }

      // const currentDate = new Date();

      // Process photos and other details
      for (let j = 0; j < result[0].hotel_photo.length; j++) {
        result[0].hotel_photo[j] = await image_url("hotel_syt", result[0].hotel_photo[j]);
      }

      for (let j = 0; j < result[0].rooms.length; j++) {
        // Check if the current date is between start_date and end_date
        // const startDate = new Date(result[0].rooms[j].start_date);
        // const endDate = new Date(result[0].rooms[j].end_date);

        // if (currentDate >= startDate && currentDate <= endDate) {
        //   result[0].rooms[j].status = result[0].rooms[j].status;
        // } else if (currentDate < startDate) {
        //   result[0].rooms[j].status = "sold out";
        // } else {
        //   result[0].rooms[j].status = "sold out";
        // }

        // const currentDate = new Date();
        // let priceFound = false;

        // if (result[0].rooms[j].price_and_date && result[0].rooms[j].price_and_date.length > 0) {
        //   for (let i = 0; i < result[0].rooms[j].price_and_date.length; i++) {
        //     const priceStartDate = new Date(result[0].rooms[j].price_and_date[i].price_start_date);
        //     console.log("priceStartDate ::", priceStartDate)
        //     const priceEndDate = new Date(result[0].rooms[j].price_and_date[i].price_end_date);
        //     console.log("priceEndDate ::", priceEndDate)

        //     if (currentDate >= priceStartDate && currentDate <= priceEndDate) {
        //       // const vender_price_per_person = result[0].rooms[j].price_per_person
        //       result[0].rooms[j].price = result[0].rooms[j].price_and_date[i].adult_price;
        //       priceFound = true;
        //       break;
        //     }
        //   }

        //   if (!priceFound) {
        //     result[0].rooms[j].price = result[0].rooms[j].price_and_date[0].adult_price;
        //   }
        // }

        for (let k = 0; k < result[0].rooms[j].photos.length; k++) {
          result[0].rooms[j].photos[k] = await image_url("room_syt", result[0].rooms[j].photos[k]);
        }
      }

      for (let j = 0; j < result[0].Highlights.length; j++) {
        result[0].Highlights[j].icon = await image_url("highlights", result[0].Highlights[j].icon);
      }

      for (let i = 0; i < result[0].hotel_reviews.length; i++) {
        const review = result[0].hotel_reviews[i];
        if (review.user_details && review.user_details.photo) {
          review.user_details.photo = await image_url("user_photos", review.user_details.photo);
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
      const destinationName = result[0].state;

      console.log(destinationName);

      // Find if this destination exists in the profit margin data
      const matchedProfitMargin = packageProfitMargin.find((state) => state.state_name === destinationName);

      // If a match is found, use the matched profit margin
      if (matchedProfitMargin) {
        result[0].profitMargin = [
          {
            state_name: matchedProfitMargin.state_name,
            month_and_margin_user: matchedProfitMargin.month_and_margin_user
          }
        ];
      } else {
        // If no match is found, create a new profit margin with admin_margin 0 for all months
        result[0].profitMargin = [
          {
            state_name: destinationName,
            month_and_margin_user: defaultMonths.map((month) => ({
              month_name: month,
              margin_percentage: "10"
            }))
          }
        ];
      }

      return this.sendJSONResponse(
        res,
        "Hotel Details fetched Successfully!",
        {
          length: result.length
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async searchRoomHotelBooking(req, res) {
  //   try {
  //     const { user_checkin, user_checkout, number_of_rooms, hotel_id } = req.body;

  //     // Step 1: Fetch rooms based on hotel_id
  //     // const rooms = await room_syt.find({ hotel_id });
  //     const rooms = await room_syt.aggregate([
  //       {
  //         $match: {
  //           hotel_id: new mongoose.Types.ObjectId(hotel_id)
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "room_prices",
  //           localField: "_id",
  //           foreignField: "room_id",
  //           as: "room_price",
  //           pipeline: [
  //             // { $unwind: "$price_and_date" },
  //             {
  //               $unwind: {
  //                 path: "$price_and_date",
  //                 preserveNullAndEmptyArrays: true
  //               }
  //             },
  //             {
  //               $group: {
  //                 _id: "$room_id",
  //                 price_and_date: { $push: "$price_and_date" },
  //                 othere_future_agency: { $first: "$othere_future_agency" }
  //               }
  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $addFields: {
  //           price_and_date: { $arrayElemAt: ["$room_price.price_and_date", 0] },
  //           othere_future_agency: { $arrayElemAt: ["$room_price.othere_future_agency", 0] }
  //         }
  //       },
  //       {
  //         $unset: "room_price" // Remove the room_price field from the final response
  //       }
  //     ]);

  //     console.log("rooms ::", rooms);

  //     const state_name = await hotel_model.findOne({ _id: hotel_id });

  //     // Step 2: Fetch all profit margins
  //     const packageProfitMargins = await package_profit_margin.find();

  //     for (let i = 0; i < rooms.length; i++) {
  //       const currentDate = new Date();
  //       let priceFound = false;

  //       if (rooms[i].price_and_date && rooms[i].price_and_date.length > 0) {
  //         for (let j = 0; j < rooms[i].price_and_date.length; j++) {
  //           const startDate = new Date(rooms[i].price_and_date[j].price_start_date);
  //           console.log(startDate)
  //           const endDate = new Date(rooms[i].price_and_date[j].price_end_date);

  //           if (currentDate >= startDate && currentDate <= endDate) {
  //             rooms[i].price = rooms[i].price_and_date[j].adult_price;
  //             priceFound = true;

  //             // Extract month and state to find the margin
  //             const startMonth = startDate.toLocaleString('default', { month: 'long' });
  //             const roomState = state_name.state;

  //             // Find the profit margin for this state and month
  //             const profitMargin = packageProfitMargins.find(
  //               margin => margin.state_name === roomState
  //             );

  //             let adminMarginPercentage = '0'; // Default to '0' if no margin found

  //             if (profitMargin) {
  //               const monthMargin = profitMargin.month_and_margin_user.find(
  //                 margin => margin.month_name.toLowerCase() === startMonth.toLowerCase()
  //               );

  //               // Set the margin if found, else default to '0'
  //               adminMarginPercentage = monthMargin ? monthMargin.margin_percentage : '0';
  //             }

  //             // Add adminMarginPercentage to the room object
  //             rooms[i].adminMarginPercentage = adminMarginPercentage;
  //             break;
  //           }

  //           if (!priceFound) {
  //             rooms[i].price = rooms[i].price_and_date[0].adult_price;
  //           }
  //         }
  //       } else {
  //         rooms[i].price = rooms[0].price;
  //       }
  //     }

  //     // Proceed with filtering rooms by availability, etc.
  //     const availableRooms = [];
  //     const baseURL = "https://start-your-tour-api.onrender.com/images/room_syt/";

  //     for (const room of rooms) {
  //       const minStartDate = room.price_and_date.reduce((minDate, range) =>
  //         minDate ? Math.min(minDate, new Date(range.price_start_date)) : new Date(range.price_start_date), null);
  //       const maxEndDate = room.price_and_date.reduce((maxDate, range) =>
  //         maxDate ? Math.max(maxDate, new Date(range.price_end_date)) : new Date(range.price_end_date), null);

  //       if (minStartDate && maxEndDate && new Date(user_checkin) >= minStartDate && new Date(user_checkout) <= maxEndDate) {
  //         const bookings = await hotel_booking_syt_Schema.find({
  //           room_id: room._id,
  //           $or: [
  //             { check_in_date: { $lte: new Date(user_checkin) }, check_out_date: { $gte: new Date(user_checkin) } },
  //             { check_in_date: { $lte: new Date(user_checkout) }, check_out_date: { $gte: new Date(user_checkout) } },
  //             { check_in_date: { $gte: new Date(user_checkin) }, check_out_date: { $lte: new Date(user_checkout) } }
  //           ]
  //         });

  //         const bookedRooms = bookings.reduce((acc, booking) => acc + booking.total_booked_rooms, 0);
  //         const availableCount = room.total_rooms - bookedRooms;

  //         if (availableCount >= number_of_rooms) {
  //           const photosWithBaseURL = room.photos.map(photo => `${baseURL}${photo}`);

  //           availableRooms.push({
  //             ...room._doc,
  //             available_rooms: availableCount,
  //             photos: photosWithBaseURL,
  //             adminMarginPercentage: room.adminMarginPercentage // Include the new admin margin variable
  //           });
  //         }
  //       }
  //     }

  //     return this.sendJSONResponse(
  //       res,
  //       "available rooms",
  //       {
  //         length: availableRooms.length
  //       },
  //       availableRooms
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  // async searchRoomHotelBooking(req, res) {
  //   try {

  //     const { user_checkin, user_checkout, number_of_rooms, hotel_id } = req.body;

  //     // Step 1: Fetch rooms based on hotel_id
  //     const rooms = await room_syt.find({
  //       hotel_id,
  //       start_date: { $lte: new Date(user_checkin) },
  //       end_date: { $gte: new Date(user_checkout) }
  //     });

  //     console.log("rooms :", rooms)

  //     // Step 2: Filter rooms based on availability in bookings
  //     const availableRooms = [];
  //     let baseURL = "https://start-your-tour-api.onrender.com/images/room_syt/"
  //     for (const room of rooms) {
  //       const bookings = await hotel_booking_syt_Schema.find({
  //         room_id: room._id,
  //         $or: [
  //           { check_in_date: { $lte: new Date(user_checkin) }, check_out_date: { $gte: new Date(user_checkin) } },
  //           { check_in_date: { $lte: new Date(user_checkout) }, check_out_date: { $gte: new Date(user_checkout) } },
  //           { check_in_date: { $gte: new Date(user_checkin) }, check_out_date: { $lte: new Date(user_checkout) } }
  //         ]
  //       });

  //       console.log("bookings :", bookings)

  //       const bookedRooms = bookings.reduce((acc, booking) => acc + booking.total_booked_rooms, 0);

  //       console.log("bookedRooms :", bookedRooms)

  //       const availableCount = room.total_rooms - bookedRooms;

  //       console.log("availableCount :", availableCount)

  //       if (availableCount >= number_of_rooms) {

  //         const photosWithBaseURL = room.photos.map(photo => `${baseURL}${photo}`);

  //         availableRooms.push({
  //           ...room._doc,
  //           available_rooms: availableCount,
  //           photos: photosWithBaseURL
  //         });
  //       }
  //     }

  //     return this.sendJSONResponse(
  //       res,
  //       "avaiable rooms",
  //       {
  //         length: 1
  //       },
  //       availableRooms
  //     );

  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async searchRoomHotelBooking(req, res) {
    try {
      const { user_checkin, user_checkout, number_of_rooms, hotel_id } = req.body;

      // Step 1: Fetch rooms based on hotel_id
      const rooms = await room_syt.aggregate([
        {
          $match: {
            hotel_id: new mongoose.Types.ObjectId(hotel_id),
            status: "available"
          }
        },
        {
          $lookup: {
            from: "room_prices",
            localField: "_id",
            foreignField: "room_id",
            as: "room_price",
            pipeline: [
              {
                $unwind: {
                  path: "$price_and_date",
                  preserveNullAndEmptyArrays: true
                }
              },
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
      ]);

      const state_name = await hotel_model.findOne({ _id: hotel_id });

      // Step 2: Fetch all profit margins
      const packageProfitMargins = await package_profit_margin.find();

      for (let i = 0; i < rooms.length; i++) {
        const currentDate = new Date();
        let priceFound = false;
        let adminMarginPercentage = 10; // Default margin
        let nearestStartDate = null;
        let nearestPrice = null;

        if (rooms[i].price_and_date && rooms[i].price_and_date.length > 0) {
          for (let j = 0; j < rooms[i].price_and_date.length; j++) {
            const startDate = new Date(rooms[i].price_and_date[j].price_start_date);
            // console.log(startDate)
            const endDate = new Date(rooms[i].price_and_date[j].price_end_date);

            // console.log(endDate)
            // console.log(currentDate)
            // if (currentDate >= startDate && currentDate <= endDate) {
            //   console.log("currentDate ::", currentDate)
            //   rooms[i].price = rooms[i].price_and_date[j].adult_price;
            //   priceFound = true;
            //   nearestStartDate = startDate;
            //   break;

            //   // Extract month and state to find the margin
            //   const startMonth = startDate.toLocaleString("default", { month: "long" });
            //   const roomState = state_name.state;
            //   console.log("roomState ::", roomState)

            //   // Find the profit margin for this state and month
            //   const profitMargin = packageProfitMargins.find((margin) => margin.state_name === roomState);
            //   console.log("profitMargin ::", profitMargin)

            //   if (profitMargin) {
            //     const monthMargin = profitMargin.month_and_margin_user.find(
            //       (margin) => margin.month_name.toLowerCase() === startMonth.toLowerCase()
            //     );

            //     // Set the margin if found, else keep default
            //     if (monthMargin) {
            //       adminMarginPercentage = parseFloat(monthMargin.margin_percentage);
            //       console.log(adminMarginPercentage)
            //     }
            //   }

            //   rooms[i].adminMarginPercentage = adminMarginPercentage;
            //   break;
            // }
            if (currentDate >= startDate && currentDate <= endDate) {
              rooms[i].price = rooms[i].price_and_date[j].adult_price;
              priceFound = true;
              nearestStartDate = startDate;
              break;
            }

            if (!nearestStartDate || startDate < nearestStartDate) {
              nearestStartDate = startDate;
              nearestPrice = rooms[i].price_and_date[j].adult_price;
            }
          }

          // Agar koi price nahi mila, to pehla available price le lo
          if (!priceFound && nearestStartDate) {
            rooms[i].price = nearestPrice;
          }
        }

        const applicableMonth = nearestStartDate
          ? nearestStartDate.toLocaleString("default", { month: "long" })
          : currentDate.toLocaleString("default", { month: "long" });
        const roomState = state_name.state;

        const profitMargin = packageProfitMargins.find((margin) => margin.state_name === roomState);
        if (profitMargin) {
          const monthMargin = profitMargin.month_and_margin_user.find(
            (margin) => margin.month_name.toLowerCase() === applicableMonth.toLowerCase()
          );
          if (monthMargin) {
            adminMarginPercentage = parseFloat(monthMargin.margin_percentage);
          }
        }

        rooms[i].adminMarginPercentage = adminMarginPercentage;
        if (rooms[i].price) {
          rooms[i].price = Math.round(rooms[i].price + (rooms[i].price * adminMarginPercentage) / 100);
        }
      }

      // Proceed with filtering rooms by availability, etc.
      const availableRooms = [];
      const baseURL = "https://syt-i471.onrender.com/images/room_syt/";

      for (const room of rooms) {
        const minStartDate = room.price_and_date.reduce(
          (minDate, range) =>
            minDate ? Math.min(minDate, new Date(range.price_start_date)) : new Date(range.price_start_date),
          null
        );
        const maxEndDate = room.price_and_date.reduce(
          (maxDate, range) =>
            maxDate ? Math.max(maxDate, new Date(range.price_end_date)) : new Date(range.price_end_date),
          null
        );

        if (
          minStartDate &&
          maxEndDate &&
          new Date(user_checkin) >= minStartDate &&
          new Date(user_checkout) <= maxEndDate
        ) {
          const bookings = await hotel_booking_syt_Schema.find({
            room_id: room._id,
            $or: [
              { check_in_date: { $lte: new Date(user_checkin) }, check_out_date: { $gte: new Date(user_checkin) } },
              { check_in_date: { $lte: new Date(user_checkout) }, check_out_date: { $gte: new Date(user_checkout) } },
              { check_in_date: { $gte: new Date(user_checkin) }, check_out_date: { $lte: new Date(user_checkout) } }
            ]
          });

          const bookedRooms = bookings.reduce((acc, booking) => acc + booking.total_booked_rooms, 0);
          const availableCount = room.total_rooms - bookedRooms;

          if (availableCount >= number_of_rooms) {
            const photosWithBaseURL = room.photos.map((photo) => `${baseURL}${photo}`);

            availableRooms.push({
              _id: room._id,
              room_title: room.room_title, // Add room_title
              photos: photosWithBaseURL,
              room_highlights: room.room_highlights, // Ensure to include room_highlights
              price_and_date: room.price_and_date, // Include price_and_date
              hotel_id: room.hotel_id,
              total_rooms: room.total_rooms,
              othere_future_agency: room.othere_future_agency,
              status: room.status,
              breakfast_price: room.breakfast_price,
              lunch_price: room.lunch_price,
              dinner_price: room.dinner_price,
              breakfast: room.breakfast,
              lunch: room.lunch,
              dinner: room.dinner,
              createdAt: room.createdAt,
              updatedAt: room.updatedAt,
              __v: room.__v,
              price: room.price,
              available_rooms: availableCount,
              adminMarginPercentage: room.adminMarginPercentage // Include the new admin margin variable
            });
          }
        }
      }

      return this.sendJSONResponse(res, "Available rooms", { length: availableRooms.length }, availableRooms);
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async admin_change_status_hotel(req, res) {
    try {
      const hotel_id = req.query._id;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency") {
        throw new Forbidden("you are not admin or agency");
      }

      let room = await room_syt_schema.findOne({ hotel_id: hotel_id });
      let amenities = await amenities_and_facilities_schema.findOne({ hotel_id: hotel_id });
      let property_policies = await property_policies_schema.findOne({ hotel_id: hotel_id });

      if (room && amenities && property_policies) {
        const updated_hotel = await hotel_model.findByIdAndUpdate(hotel_id, { status: req.body.status }, { new: true });

        if (!updated_hotel) {
          throw new Forbidden("Status not Changed! Try Again");
        }

        return this.sendJSONResponse(res, "Status Updated Successfully!", { length: 1 }, updated_hotel);
      } else {
        // If any of the required fields are missing
        return res.status(403).json({
          success: false,
          message: "Please provide all hotel information (Room, Amenities, and Property Policies)."
        });
      }
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async update_hotel(req, res) {
  //   try {
  //     const id = req.query._id;
  //     const tokenData = req.userData;
  //     if (tokenData === "") {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }
  //     const userData = await userSchema.find({ _id: tokenData.id });

  //     if (userData[0].role !== "admin" && userData[0].role !== "agency") {
  //       throw new Forbidden("you are not admin or agency");
  //     }

  //     const update_hotel = await hotel_model.findById(id);
  //     const data = {
  //       hotel_name: req.body.hotel_name,
  //       hotel_address: req.body.hotel_address,
  //       hotel_description: req.body.hotel_description,
  //       hotel_highlights: req.body.hotel_highlights,
  //       city: req.body.city,
  //       hotel_type: req.body.hotel_type,
  //       state: req.body.state,
  //       other: req.body.other
  //       // status: req.body.status,
  //     };

  //     const arrayimages = update_hotel.hotel_photo
  //     console.log(arrayimages);
  //     if (req.files && req.files.length > 0) {
  //       data.hotel_photo = req.files.map((file) => file.filename);
  //     }
  //     if (!update_hotel) {
  //       throw new Forbidden("hotel not update! Please insert again");
  //     }
  //     const result = await hotel_model.findOneAndUpdate({ _id: id, user_id: tokenData.id }, data, { new: true });
  //     return this.sendJSONResponse(
  //       res,
  //       "hotel update Successfully!",
  //       {
  //         length: 1
  //       },
  //       result
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async update_hotel(req, res) {
    try {
      const id = req.query._id;
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency") {
        throw new Forbidden("You are not admin or agency");
      }

      const update_hotel = await hotel_model.findById(id);
      if (!update_hotel) {
        throw new Forbidden("Hotel not found! Please insert again");
      }

      const data = {
        hotel_name: req.body.hotel_name,
        hotel_address: req.body.hotel_address,
        hotel_description: req.body.hotel_description,
        hotel_highlights: req.body.hotel_highlights,
        breakfast_price: req.body.breakfast_price,
        lunch_price: req.body.lunch_price,
        dinner_price: req.body.dinner_price,
        city: req.body.city,
        hotel_type: req.body.hotel_type,
        state: req.body.state,
        other: req.body.other,
        lunch: req.body.lunch,
        dinner: req.body.dinner,
        breakfast: req.body.breakfast
        // status: req.body.status,
      };

      let previmages1 = Array.isArray(req.body.previmages) ? req.body.previmages : [req.body.previmages];

      console.log("previmages1 " + previmages1);

      const baseUrl = "https://syt-i471.onrender.com/images/hotel_syt/";

      previmages1 = previmages1
        .filter(Boolean)
        .map((img) => (img.startsWith(baseUrl) ? img.replace(baseUrl, "") : img));

      console.log("IMAGE LOG  " + previmages1);

      // if (req.files && req.files.length > 0) {
      //   const previmages2 = req.files.map((file) => file.filename);
      // }
      let previmages2 = req.files ? req.files.map((file) => file.filename) : [];

      console.log("previmages2 ..." + previmages2);

      data.hotel_photo = [...previmages1, ...previmages2];

      console.log("data.." + data.hotel_photo);

      const result = await hotel_model.findOneAndUpdate({ _id: id }, data, { new: true });

      return this.sendJSONResponse(
        res,
        "Hotel updated successfully!",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_hotel(req, res) {
    try {
      const id = req.query._id;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency") {
        throw new Forbidden("you are not admin or agency");
      }

      const response = await hotel_model.deleteOne({ _id: id });

      return this.sendJSONResponse(
        res,
        "hotel delete Successfully!",
        {
          length: 1
        },
        response
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
