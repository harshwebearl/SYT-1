const room_syt_schema = require("../models/room_syt_schema");
const BaseController = require("./BaseController");
const NotFound = require("../errors/NotFound");
const Forbidden = require("../errors/Forbidden");
const userSchema = require("../models/usersSchema");
const { default: mongoose } = require("mongoose");
const image_url = require("../update_url_path.js");
const package_profit_margin = require("../models/package_profit_margin.js");
const fn = "room_syt";
const Room_price = require("../models/room_price");

module.exports = class room_controller extends BaseController {
  async add_room(req, res) {
    try {
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

      // const priceAndDateArray = req.body.price_and_date;

      // // Validate for overlapping or duplicate date ranges
      // for (let i = 0; i < priceAndDateArray.length; i++) {
      //   const currentStartDate = new Date(priceAndDateArray[i].price_start_date);
      //   const currentEndDate = new Date(priceAndDateArray[i].price_end_date);

      //   // Ensure the start date is before the end date
      //   if (currentStartDate >= currentEndDate) {
      //     throw new Forbidden(`Dates are mismatched, please change the dates in Price Range`);
      //   }

      //   // Ensure price start and end dates fall within the package start and end dates
      //   // if (currentStartDate < packageStartDate || currentEndDate > packageEndDate) {
      //   //   throw new Forbidden(`Invalid Date`);
      //   // }

      //   // Check for overlapping date ranges within the price_and_date array
      //   for (let j = 0; j < priceAndDateArray.length; j++) {
      //     if (i !== j) { // Don't compare the same element
      //       const nextStartDate = new Date(priceAndDateArray[j].price_start_date);
      //       const nextEndDate = new Date(priceAndDateArray[j].price_end_date);

      //       // Check for overlapping date ranges
      //       if (currentStartDate <= nextEndDate && currentEndDate >= nextStartDate) {
      //         throw new Forbidden(`Dates are mismatched, please change the dates in Price Range`);
      //       }
      //     }
      //   }
      // }

      let roomTitle = await room_syt_schema.findOne({ hotel_id: req.body.hotel_id, room_title: req.body.room_title });

      if (roomTitle) {
        throw new Forbidden("Room title already exists for the same hotel");
      }

      const room = {
        room_title: req.body.room_title,
        room_highlights: req.body.room_highlights,
        // price_and_date: req.body.price_and_date,
        price: req.body.price,
        hotel_id: req.body.hotel_id,
        photos: req.files.map((file) => file.filename),
        total_rooms: req.body.total_rooms,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        // othere_future_agency: req.body.othere_future_agency,
        status: req.body.status,
        breakfast_price: req.body.breakfast_price,
        lunch_price: req.body.lunch_price,
        dinner_price: req.body.dinner_price,
        lunch: req.body.lunch,
        dinner: req.body.dinner,
        breakfast: req.body.breakfast
      };

      const new_room = new room_syt_schema(room);
      const result = await new_room.save();

      let room_price = await Room_price.create({
        room_id: result._id,
        agency_id: tokenData.id,
        hotel_id: req.body.hotel_id,
        price_and_date: req.body.price_and_date,
        othere_future_agency: req.body.othere_future_agency
      });

      if (result.length == 0) {
        throw new Forbidden("room not saved ! please insert again");
      }
      return this.sendJSONResponse(
        res,
        "room Added Succesfully !",
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

  // async get_room(req, res) {
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

  //     const result = await room_syt_schema.aggregate([
  //       {
  //         $lookup: {
  //           from: "hotel_syts",
  //           localField: "hotel_id",
  //           foreignField: "_id",
  //           as: "hotel_details"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "room_prices",
  //           localField: "_id",
  //           foreignField: "room_id",
  //           as: "room_price",
  //           pipeline: [
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
  //       },
  //       {
  //         $project: {
  //           "_id": 1,
  //           "room_title": 1,
  //           "price_and_date": 1,
  //           "photos": 1,
  //           "room_highlights": 1,
  //           "price": 1,
  //           "hotel_id": 1,
  //           "total_rooms": 1,
  //           "start_date": 1,
  //           "end_date": 1,
  //           "othere_future_agency": 1,
  //           "status": 1,
  //           "lunch_price": 1,
  //           "dinner_price": 1,
  //           "breakfast_price": 1,
  //           "lunch": 1,
  //           "dinner": 1,
  //           "breakfast": 1,
  //           "createdAt": 1,
  //           "updatedAt": 1,
  //           "__v": 1,
  //           "hotel_details._id": 1,
  //           "hotel_details.hotel_name": 1,
  //           "hotel_details.hotel_address": 1,
  //           "hotel_details.state": 1,
  //           "hotel_details.lunch_price": 1,
  //           "hotel_details.dinner_price": 1,
  //           "hotel_details.breakfast_price": 1,
  //           "hotel_details.lunch": 1,
  //           "hotel_details.dinner": 1,
  //           "hotel_details.breakfast": 1
  //         }
  //       }
  //     ]);

  //     if (result.length == 0) {
  //       throw new Forbidden(" room not get ! please insert again");
  //     }

  //     for (let i = 0; i < result.length; i++) {
  //       for (let j = 0; j < result[i].photos.length; j++) {
  //         result[i].photos[j] = await image_url(fn, result[i].photos[j]);
  //       }

  //       const currentDate = new Date();
  //       let priceFound = false;

  //       if (result[i].price_and_date && result[i].price_and_date.length > 0) {
  //         for (let j = 0; j < result[i].price_and_date.length; j++) {
  //           const startDate = new Date(result[i].price_and_date[j].price_start_date);
  //           console.log(startDate);
  //           const endDate = new Date(result[i].price_and_date[j].price_end_date);

  //           if (currentDate >= startDate && currentDate <= endDate) {
  //             result[i].price = result[i].price_and_date[j].adult_price;
  //             priceFound = true;
  //             break;
  //           }

  //           if (!priceFound) {
  //             console.log("abc");
  //             result[i].price = result[i].price_and_date[0].adult_price;
  //           }
  //         }
  //       } else {
  //         console.log("123");
  //         console.log("456", i);
  //         result[i].price = result[0].price;
  //       }
  //     }
  //     return this.sendJSONResponse(
  //       res,
  //       "room get Succesfully !",
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

  async get_room(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({ message: "Auth fail" });
      }

      const userData = await userSchema.find({ _id: tokenData.id });

      if (!["admin", "agency", "customer"].includes(userData[0].role)) {
        throw new Forbidden("You are not admin, agency, or customer");
      }

      const result = await room_syt_schema.aggregate([
        {
          $lookup: {
            from: "hotel_syts",
            localField: "hotel_id",
            foreignField: "_id",
            as: "hotel_details"
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
        },
        {
          $project: {
            "_id": 1,
            "room_title": 1,
            "photos": 1,
            "room_highlights": 1,
            "hotel_id": 1,
            "total_rooms": 1,
            "status": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "__v": 1,
            "hotel_details._id": 1,
            "hotel_details.hotel_name": 1,
            "hotel_details.hotel_address": 1,
            "hotel_details.state": 1,
            "price_and_date": 1,
            "othere_future_agency": 1,
            "price": 1
          }
        }
      ]);

      if (result.length === 0) {
        throw new Forbidden("Room not found! Please insert again");
      }

      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].photos.length; j++) {
          result[i].photos[j] = await image_url("roomphoto", result[i].photos[j]);
        }

        const currentDate = new Date();
        let priceFound = false;
        let selectedMonth = null;

        if (result[i].price_and_date && result[i].price_and_date.length > 0) {
          for (let j = 0; j < result[i].price_and_date.length; j++) {
            const startDate = new Date(result[i].price_and_date[j].price_start_date);
            const endDate = new Date(result[i].price_and_date[j].price_end_date);

            if (currentDate >= startDate && currentDate <= endDate) {
              result[i].price = result[i].price_and_date[j].adult_price;
              selectedMonth = startDate.toLocaleString("default", { month: "long" });
              priceFound = true;
              break;
            }
          }
          if (!priceFound) {
            result[i].price = result[i].price_and_date[0].adult_price;
            selectedMonth = new Date(result[i].price_and_date[0].price_start_date).toLocaleString("default", {
              month: "long"
            });
          }
        } else {
          result[i].price = result[0].price;
        }

        console.log("📅 Selected Month:", selectedMonth);

        // Step 1: Find Admin Margin
        const hotelState = result[i].hotel_details[0]?.state;
        const matchedProfitMargin = await package_profit_margin.findOne({ state_name: hotelState });

        let adminMarginPercentage = 10; // Default margin

        if (matchedProfitMargin) {
          const profitMargin = matchedProfitMargin.month_and_margin_user.find(
            (margin) => margin.month_name === selectedMonth
          );

          if (profitMargin) {
            adminMarginPercentage = parseFloat(profitMargin.margin_percentage);
          }
        }

        // Step 2: Apply Margin to Price
        const adminMarginDecimal = adminMarginPercentage / 100;
        result[i].price = Math.round(result[i].price * (1 + adminMarginDecimal));

        console.log(`💰 Applied Admin Margin (${adminMarginPercentage}%): ${result[i].price}`);
      }

      return this.sendJSONResponse(res, "Rooms fetched successfully!", { length: result.length }, result);
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async get_room_byid(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      const packageProfitMargin = await package_profit_margin.find();

      if (userData[0].role !== "admin" && userData[0].role !== "agency" && userData[0].role !== "customer") {
        throw new Forbidden("you are not admin or agency or customer");
      }
      const room_id = req.query._id;
      const result = await room_syt_schema.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(room_id) }
        },
        {
          $lookup: {
            from: "hotel_syts",
            localField: "hotel_id",
            foreignField: "_id",
            as: "hotel_details"
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
          $unset: "room_price" // Remove the room_price field from the final response
        },
        {
          $project: {
            _id: 1,
            room_title: 1,
            photos: 1,
            price_and_date: 1,
            room_highlights: 1,
            price: 1,
            hotel_id: 1,
            total_rooms: 1,
            start_date: 1,
            end_date: 1,
            status: 1,
            lunch_price: 1,
            dinner_price: 1,
            breakfast_price: 1,
            lunch: 1,
            dinner: 1,
            breakfast: 1,
            othere_future_agency: 1,
            createdAt: 1,
            updatedAt: 1,
            hotel_details: {
              _id: 1,
              hotel_name: 1,
              hotel_address: 1,
              state: 1,
              lunch_price: 1,
              dinner_price: 1,
              breakfast_price: 1,
              lunch: 1,
              dinner: 1,
              breakfast: 1
            }
          }
        }
      ]);
      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[0].photos.length; j++) {
          result[0].photos[j] = await image_url(fn, result[0].photos[j]);
        }

        const currentDate = new Date();
        let priceFound = false;

        if (result[0].price_and_date && result[0].price_and_date.length > 0) {
          for (let i = 0; i < result[0].price_and_date.length; i++) {
            const priceStartDate = new Date(result[0].price_and_date[i].price_start_date);
            console.log("priceStartDate ::", priceStartDate);
            const priceEndDate = new Date(result[0].price_and_date[i].price_end_date);
            console.log("priceEndDate ::", priceEndDate);

            if (currentDate >= priceStartDate && currentDate <= priceEndDate) {
              // const vender_price_per_person = result[0].price_per_person
              result[0].price = result[0].price_and_date[i].adult_price;
              priceFound = true;
              break;
            }
          }

          if (!priceFound) {
            result[0].price = result[0].price_and_date[0].adult_price;
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
      const destinationName = result[0].hotel_details[0].state;

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
        "room get Succesfully !",
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

  async update_room(req, res) {
    try {
      const room_id = req.query._id;
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

      // const priceAndDateArray = req.body.price_and_date;

      // // Validate for overlapping or duplicate date ranges
      // for (let i = 0; i < priceAndDateArray.length; i++) {
      //   const currentStartDate = new Date(priceAndDateArray[i].price_start_date);
      //   const currentEndDate = new Date(priceAndDateArray[i].price_end_date);

      //   // Ensure the start date is before the end date
      //   if (currentStartDate >= currentEndDate) {
      //     throw new Forbidden(`Dates are mismatched, please change the dates in Price Range`);
      //   }

      //   // Ensure price start and end dates fall within the package start and end dates
      //   // if (currentStartDate < packageStartDate || currentEndDate > packageEndDate) {
      //   //   throw new Forbidden(`Invalid Date`);
      //   // }

      //   // Check for overlapping date ranges within the price_and_date array
      //   for (let j = 0; j < priceAndDateArray.length; j++) {
      //     if (i !== j) { // Don't compare the same element
      //       const nextStartDate = new Date(priceAndDateArray[j].price_start_date);
      //       const nextEndDate = new Date(priceAndDateArray[j].price_end_date);

      //       // Check for overlapping date ranges
      //       if (currentStartDate <= nextEndDate && currentEndDate >= nextStartDate) {
      //         throw new Forbidden(`Dates are mismatched, please change the dates in Price Range`);
      //       }
      //     }
      //   }
      // }

      const room_data = {
        room_title: req.body.room_title,
        price_and_date: req.body.price_end_date,
        room_highlights: req.body.room_highlights,
        price: req.body.price,
        total_rooms: req.body.total_rooms,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        status: req.body.status,
        othere_future_agency: req.body.othere_future_agency,
        breakfast_price: req.body.breakfast_price,
        lunch_price: req.body.lunch_price,
        dinner_price: req.body.dinner_price,
        lunch: req.body.lunch,
        dinner: req.body.dinner,
        breakfast: req.body.breakfast
        // photos: req.files.map((file) => file.filename)
      };

      let previmages1 = Array.isArray(req.body.previmages) ? req.body.previmages : [req.body.previmages];

      console.log("previmages1 " + previmages1);

      const baseUrl = "https://syt-i471.onrender.com/images/room_syt/";

      previmages1 = previmages1
        .filter(Boolean)
        .map((img) => (img.startsWith(baseUrl) ? img.replace(baseUrl, "") : img));

      console.log("IMAGE LOG  " + previmages1);

      // if (req.files && req.files.length > 0) {
      //   const previmages2 = req.files.map((file) => file.filename);
      // }
      let previmages2 = req.files ? req.files.map((file) => file.filename) : [];

      console.log("previmages2 ..." + previmages2);

      room_data.photos = [...previmages1, ...previmages2];

      console.log("data.." + room_data.photos);

      const updated_room = await room_syt_schema.findByIdAndUpdate(room_id, room_data, { new: true });
      const updated_room_price = await Room_price.findOneAndUpdate(
        { room_id: room_id },
        { price_and_date: req.body.price_and_date, othere_future_agency: req.body.othere_future_agency },
        { new: true }
      );

      if (!updated_room) {
        throw new Forbidden("Unable to update room");
      }
      return this.sendJSONResponse(
        res,
        "Room Updated Succesfully!",
        {
          length: 1
        },
        updated_room
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_room(req, res) {
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

      const response = await room_syt_schema.deleteOne({ _id: id });
      if (response.deletedCount > 0) {
        return this.sendJSONResponse(
          res,
          "room delete Succesfully !",
          {
            length: 1
          },
          response
        );
      } else {
        throw new Forbidden("room not delete ! please insert again");
      }
    } catch (error) {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
};
