const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const hotelBookingSchema = require("../models/hotel_booking_syt_schema");
const hotelSchema = require("../models/hotel_syt_schema");
const mongoose = require("mongoose");
const imageUrl = require("../update_url_path.js");
const { getReceiverSocketId, io } = require("../socket/socket.js");
const packageProfitMargin = require("../models/package_profit_margin.js");
const BASE_URL = "https://start-your-tour-api.onrender.com/images/hotel_syt/";
const BASE_URL1 = "https://start-your-tour-api.onrender.com/images/room_syt/";

module.exports = class HotelBookSytController extends BaseController {
  async userBookedHotel(req, res) {
    try {
      const { id } = req.userData || {};
      if (!id) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      const user = await userSchema.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.role !== "customer") {
        throw new Forbidden("Only customers can book hotels");
      }

      const currentDate = new Date();
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const currentMonth = monthNames[currentDate.getMonth()];

      let adminMarginPercentage = 10;
      let adminMarginPriceAdult = Math.round(req.body.price_per_person_adult * 0.1);
      let adminMarginPriceChild = Math.round(req.body.price_per_person_child * 0.1);

      const packageMargin = await packageProfitMargin.findOne({ state_name: req.body.state });
      if (packageMargin?.month_and_margin_user) {
        const marginObj = packageMargin.month_and_margin_user.find(
          (margin) => margin.month_name === currentMonth
        );
        if (marginObj) {
          const percentage = marginObj.margin_percentage / 100;
          adminMarginPercentage = marginObj.margin_percentage;
          adminMarginPriceAdult = Math.round(req.body.price_per_person_adult * percentage);
          adminMarginPriceChild = Math.round(req.body.price_per_person_child * percentage);
        }
      }

      const bookedData = {
        hotel_id: req.body.hotel_id,
        room_id: req.body.room_id,
        total_booked_rooms: req.body.total_booked_rooms,
        check_in_date: req.body.check_in_date,
        check_out_date: req.body.check_out_date,
        date_time: req.body.date_time,
        total_adult: req.body.total_adult,
        total_child: req.body.total_child,
        payment_type: req.body.payment_type,
        user_id: id,
        status: "pending",
        room_title: req.body.room_title,
        price: req.body.price,
        user_name: req.body.user_name,
        gender: req.body.gender,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        dob: req.body.dob,
        contact_no: req.body.contact_no,
        price_per_person_adult: req.body.price_per_person_adult,
        price_per_person_child: req.body.price_per_person_child,
        admin_margin_percentage: adminMarginPercentage,
        admin_margin_price_adult: adminMarginPriceAdult,
        admin_margin_price_child: adminMarginPriceChild,
      };

      const newBooking = new hotelBookingSchema(bookedData);
      const result = await newBooking.save();

      const receiverSocketId = getReceiverSocketId(id);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newBooking", bookedData);
      }

      return this.sendJSONResponse(
        res,
        "Hotel booked successfully!",
        { length: 1 },
        result
      );
    } catch (error) {
      return this.sendErrorResponse(req, res, error instanceof NotFound ? error : new Error(error.message));
    }
  }

  async userDisplayBookedHotel(req, res) {
    try {
      const { id } = req.userData || {};
      if (!id) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      const user = await userSchema.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.role !== "customer") {
        throw new Forbidden("Only customers can view their bookings");
      }

      const bookedData = await hotelBookingSchema.aggregate([
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(id),
            status: { $in: ["booked", "approve"] },
          },
        },
        {
          $lookup: {
            from: "hotel_syts",
            localField: "hotel_id",
            foreignField: "_id",
            as: "hotel_details",
          },
        },
        {
          $unwind: {
            path: "$hotel_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            "hotel_details.hotel_photo": {
              $arrayElemAt: ["$hotel_details.hotel_photo", 0],
            },
          },
        },
        {
          $project: {
            _id: 1,
            hotel_id: 1,
            room_id: 1,
            total_booked_rooms: 1,
            user_id: 1,
            transaction_id: 1,
            check_in_date: 1,
            check_out_date: 1,
            date_time: 1,
            total_adult: 1,
            total_child: 1,
            payment_type: 1,
            status: 1,
            room_title: 1,
            price: 1,
            user_name: 1,
            gender: 1,
            country: 1,
            gst_price: 1,
            state: 1,
            city: 1,
            contact_no: 1,
            admin_margin_percentage: 1,
            admin_margin_price_adult: 1,
            admin_margin_price_child: 1,
            price_per_person_adult: 1,
            price_per_person_child: 1,
            travel_details: 1,
            booktype: "hotel",
            breakfast: 1,
            lunch: 1,
            dinner: 1,
            breakfast_price: 1,
            lunch_price: 1,
            dinner_price: 1,
            "hotel_details._id": 1,
            "hotel_details.hotel_name": 1,
            "hotel_details.hotel_address": 1,
            "hotel_details.hotel_photo": 1,
          },
        },
      ]);

      bookedData.forEach((booking) => {
        if (booking.hotel_details?.hotel_photo) {
          booking.hotel_details.hotel_photo = BASE_URL + booking.hotel_details.hotel_photo;
        }
      });

      if (!bookedData.length) {
        throw new Forbidden("No booked hotels found");
      }

      return this.sendJSONResponse(
        res,
        "Hotel booking data retrieved!",
        { length: bookedData.length },
        bookedData
      );
    } catch (error) {
      return this.sendErrorResponse(req, res, error instanceof NotFound ? error : new Error(error.message));
    }
  }

  async agencyDisplayAllBookedHotel(req, res) {
    try {
      const { id } = req.userData || {};
      if (!id) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      const user = await userSchema.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!["admin", "agency"].includes(user.role)) {
        throw new Forbidden("Only admins or agencies can view all bookings");
      }

      const hotelData = await hotelSchema.find({ user_id: id });
      const hotelIds = hotelData.map((hotel) => hotel._id);

      const bookedData = await hotelBookingSchema.aggregate([
        {
          $match: {
            hotel_id: { $in: hotelIds },
            status: { $in: ["booked", "approve", "reject"] },
          },
        },
        {
          $lookup: {
            from: "hotel_syts",
            localField: "hotel_id",
            foreignField: "_id",
            as: "hotel_details",
          },
        },
        {
          $lookup: {
            from: "room_syts",
            localField: "room_id",
            foreignField: "_id",
            as: "room_details",
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $project: {
            _id: 1,
            hotel_id: 1,
            room_id: 1,
            total_booked_rooms: 1,
            user_id: 1,
            transaction_id: 1,
            check_in_date: 1,
            check_out_date: 1,
            date_time: 1,
            total_adult: 1,
            total_child: 1,
            payment_type: 1,
            status: 1,
            room_title: 1,
            price: 1,
            user_name: 1,
            gender: 1,
            country: 1,
            state: 1,
            gst_price: 1,
            city: 1,
            dob: 1,
            admin_margin_price_child: 1,
            admin_margin_price_adult: 1,
            admin_margin_percentage: 1,
            price_per_person_adult: 1,
            price_per_person_child: 1,
            contact_no: 1,
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
            breakfast: 1,
            lunch: 1,
            dinner: 1,
            breakfast_price: 1,
            lunch_price: 1,
            dinner_price: 1,
            "hotel_details._id": 1,
            "hotel_details.hotel_name": 1,
            "hotel_details.hotel_address": 1,
            "room_details._id": 1,
            "room_details.room_title": 1,
            "room_details.photos": 1,
            "room_details.price": 1,
            "room_details.othere_future_agency": 1,
            travel_details: 1,
          },
        },
      ]);

      if (!bookedData.length) {
        throw new Forbidden("No booked hotels found");
      }

      for (const booking of bookedData) {
        if (booking.room_details?.[0]?.photos) {
          booking.room_details[0].photos = await Promise.all(
            booking.room_details[0].photos.map((photo) => imageUrl("room_syt", photo))
          );
        }
      }

      return this.sendJSONResponse(
        res,
        "Hotel booked data retrieved!",
        { length: bookedData.length },
        bookedData
      );
    } catch (error) {
      return this.sendErrorResponse(req, res, error instanceof NotFound ? error : new Error(error.message));
    }
  }

  async adminDisplayAllBookedHotel(req, res) {
    try {
      const { id } = req.userData || {};
      if (!id) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      const user = await userSchema.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.role !== "admin") {
        throw new Forbidden("Only admins can view all bookings");
      }

      const bookedData = await hotelBookingSchema.aggregate([
        {
          $match: { status: { $in: ["booked", "approve", "reject"] } },
        },
        {
          $lookup: {
            from: "hotel_syts",
            localField: "hotel_id",
            foreignField: "_id",
            as: "hotel_details",
          },
        },
        {
          $lookup: {
            from: "room_syts",
            localField: "room_id",
            foreignField: "_id",
            as: "room_details",
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $addFields: {
            "hotel_details.hotel_photo": {
              $arrayElemAt: ["$hotel_details.hotel_photo", 0],
            },
          },
        },
        {
          $project: {
            _id: 1,
            hotel_id: 1,
            room_id: 1,
            total_booked_rooms: 1,
            user_id: 1,
            check_in_date: 1,
            check_out_date: 1,
            transaction_id: 1,
            date_time: 1,
            total_adult: 1,
            total_child: 1,
            payment_type: 1,
            status: 1,
            room_title: 1,
            price: 1,
            user_name: 1,
            gender: 1,
            gst_price: 1,
            country: 1,
            state: 1,
            city: 1,
            dob: 1,
            breakfast: 1,
            lunch: 1,
            dinner: 1,
            breakfast_price: 1,
            lunch_price: 1,
            dinner_price: 1,
            admin_margin_price_child: 1,
            admin_margin_price_adult: 1,
            admin_margin_percentage: 1,
            price_per_person_adult: 1,
            price_per_person_child: 1,
            contact_no: 1,
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
            "hotel_details._id": 1,
            "hotel_details.hotel_name": 1,
            "hotel_details.hotel_address": 1,
            "hotel_details.hotel_photo": 1,
            "room_details._id": 1,
            "room_details.room_title": 1,
            "room_details.photos": 1,
            "room_details.price": 1,
            "room_details.othere_future_agency": 1,
            travel_details: 1,
          },
        },
      ]);

      bookedData.forEach((booking) => {
        if (booking.hotel_details?.[0]?.hotel_photo) {
          booking.hotel_details[0].hotel_photo = BASE_URL + booking.hotel_details[0].hotel_photo;
        }
        if (booking.room_details?.[0]?.photos) {
          booking.room_details[0].photos = booking.room_details[0].photos.map(
            (photo) => BASE_URL1 + photo
          );
        }
      });

      if (!bookedData.length) {
        throw new Forbidden("No booked hotels found");
      }

      return this.sendJSONResponse(
        res,
        "Hotel booked data retrieved!",
        { length: bookedData.length },
        bookedData
      );
    } catch (error) {
      return this.sendErrorResponse(req, res, error instanceof NotFound ? error : new Error(error.message));
    }
  }

  async adminDisplayDetailsBookedHotel(req, res) {
    try {
      const { id } = req.userData || {};
      if (!id) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      const user = await userSchema.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!["admin", "agency", "customer"].includes(user.role)) {
        throw new Forbidden("Only admins, agencies, or customers can view booking details");
      }

      const bookingId = req.params._id;
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({ message: "Invalid booking ID format" });
      }

      const bookedData = await hotelBookingSchema.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(bookingId) },
        },
        {
          $lookup: {
            from: "hotel_syts",
            localField: "hotel_id",
            foreignField: "_id",
            as: "hotel_details",
          },
        },
        {
          $lookup: {
            from: "room_syts",
            localField: "room_id",
            foreignField: "_id",
            as: "room_details",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "users",
          },
        },
        {
          $unwind: { path: "$users", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "customers",
            localField: "users._id",
            foreignField: "user_id",
            as: "customer_details",
          },
        },
        {
          $unwind: { path: "$customer_details", preserveNullAndEmptyArrays: true },
        },
        {
          $addFields: { "users.customer_details": "$customer_details" },
        },
        {
          $group: {
            _id: "$_id",
            hotel_id: { $first: "$hotel_id" },
            room_id: { $first: "$room_id" },
            total_booked_rooms: { $first: "$total_booked_rooms" },
            user_id: { $first: "$user_id" },
            check_in_date: { $first: "$check_in_date" },
            check_out_date: { $first: "$check_out_date" },
            transaction_id: { $first: "$transaction_id" },
            date_time: { $first: "$date_time" },
            total_adult: { $first: "$total_adult" },
            total_child: { $first: "$total_child" },
            payment_type: { $first: "$payment_type" },
            status: { $first: "$status" },
            room_title: { $first: "$room_title" },
            price: { $first: "$price" },
            user_name: { $first: "$user_name" },
            gender: { $first: "$gender" },
            country: { $first: "$country" },
            state: { $first: "$state" },
            city: { $first: "$city" },
            dob: { $first: "$dob" },
            travel_details: { $first: "$travel_details" },
            admin_margin_price_child: { $first: "$admin_margin_price_child" },
            admin_margin_price_adult: { $first: "$admin_margin_price_adult" },
            admin_margin_percentage: { $first: "$admin_margin_percentage" },
            price_per_person_adult: { $first: "$price_per_person_adult" },
            price_per_person_child: { $first: "$price_per_person_child" },
            contact_no: { $first: "$contact_no" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            breakfast: { $first: "$breakfast" },
            lunch: { $first: "$lunch" },
            dinner: { $first: "$dinner" },
            breakfast_price: { $first: "$breakfast_price" },
            lunch_price: { $first: "$lunch_price" },
            dinner_price: { $first: "$dinner_price" },
            gst_price: { $first: "$gst_price" },
            __v: { $first: "$__v" },
            users: { $push: "$users" },
            hotel_details: { $first: "$hotel_details" },
            room_details: { $first: "$room_details" },
          },
        },
        {
          $project: {
            _id: 1,
            hotel_id: 1,
            room_id: 1,
            total_booked_rooms: 1,
            user_id: 1,
            check_in_date: 1,
            check_out_date: 1,
            date_time: 1,
            total_adult: 1,
            transaction_id: 1,
            total_child: 1,
            payment_type: 1,
            status: 1,
            room_title: 1,
            price: 1,
            user_name: 1,
            gender: 1,
            country: 1,
            state: 1,
            city: 1,
            dob: 1,
            admin_margin_price_child: 1,
            admin_margin_price_adult: 1,
            admin_margin_percentage: 1,
            price_per_person_adult: 1,
            price_per_person_child: 1,
            travel_details: 1,
            gst_price: 1,
            breakfast: 1,
            lunch: 1,
            dinner: 1,
            breakfast_price: 1,
            lunch_price: 1,
            dinner_price: 1,
            contact_no: 1,
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
            "users._id": 1,
            "users.phone": 1,
            "users.customer_details.name": 1,
            "users.customer_details.email_address": 1,
            "users.customer_details.gender": 1,
            "users.customer_details.state": 1,
            "users.customer_details.city": 1,
            "users.customer_details.photo": 1,
            hotel_details: 1,
            room_details: 1,
          },
        },
      ]);

      if (!bookedData.length) {
        throw new Forbidden("No booked hotel found");
      }

      for (const booking of bookedData) {
        if (booking.room_details?.[0]?.photos) {
          booking.room_details[0].photos = await Promise.all(
            booking.room_details[0].photos.map((photo) => imageUrl("room_syt", photo))
          );
        }
        if (booking.hotel_details?.[0]?.hotel_photo) {
          booking.hotel_details[0].hotel_photo = await Promise.all(
            booking.hotel_details[0].hotel_photo.map((photo) => imageUrl("hotel_syt", photo))
          );
        }
      }

      return this.sendJSONResponse(
        res,
        "Hotel booked data retrieved!",
        { length: bookedData.length },
        bookedData
      );
    } catch (error) {
      return this.sendErrorResponse(req, res, error instanceof NotFound ? error : new Error(error.message));
    }
  }

  async hotelStatusChangeApi(req, res) {
    try {
      const { id } = req.userData || {};
      if (!id) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      const user = await userSchema.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!["admin", "agency"].includes(user.role)) {
        throw new Forbidden("Only admins or agencies can change booking status");
      }

      const hotelBookedId = req.params.hotel_booked_id;
      if (!mongoose.Types.ObjectId.isValid(hotelBookedId)) {
        return res.status(400).json({ success: false, message: "Invalid booking ID" });
      }

      const updateData = { status: req.body.status };
      const updatedData = await hotelBookingSchema.findByIdAndUpdate(hotelBookedId, updateData, { new: true });

      if (!updatedData) {
        return res.status(404).json({ success: false, message: "Hotel booking not found" });
      }

      io.emit("statusChange", { hotel_booked_id: hotelBookedId, status: req.body.status });

      return res.status(200).json({
        success: true,
        message: "Status updated successfully",
        data: updatedData,
      });
    } catch (error) {
      return this.sendErrorResponse(req, res, error instanceof NotFound ? error : new Error(error.message));
    }
  }

  async hotelStatusCancelByUser(req, res) {
    try {
      const { id } = req.userData || {};
      if (!id) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      const user = await userSchema.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.role !== "customer") {
        throw new Forbidden("Only customers can cancel bookings");
      }

      const hotelBookedId = req.params.hotel_booked_id;
      if (!mongoose.Types.ObjectId.isValid(hotelBookedId)) {
        return res.status(400).json({ success: false, message: "Invalid booking ID" });
      }

      const updateData = { status: "cancel" };
      const updatedData = await hotelBookingSchema.findByIdAndUpdate(hotelBookedId, updateData, { new: true });

      if (!updatedData) {
        return res.status(404).json({ success: false, message: "Hotel booking not found" });
      }

      io.emit("statusCancel", { hotel_booked_id: hotelBookedId, status: "cancel" });

      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        data: updatedData,
      });
    } catch (error) {
      return this.sendErrorResponse(req, res, error instanceof NotFound ? error : new Error(error.message));
    }
  }
};