const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const cancel_hotel_booking_syt_schema = require("../models/cancle_hotel_booking_syt_schema");
const mongoose = require("mongoose");

module.exports = class cancel_hotel_booking_Controller extends BaseController {
  async user_cancle_booked_hotel(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "customer") {
        throw new Forbidden("you are not customer");
      }

      const hotel_booked_id = req.body.hotel_booked_id;

      const cancle_data = {
        hotel_booked_id: mongoose.Types.ObjectId(hotel_booked_id),
        cancle_policy_status: true,
        date_time: Date.now(),
        user_id: tokenData.id
      };

      const new_cancle_booking = new cancel_hotel_booking_syt_schema(cancle_data);

      const result = await new_cancle_booking.save();

      if (result.length == 0) {
        throw new Forbidden("Cancling Hotel Failed ! Try again");
      }

      const updated_result = await hotel_booking_schema.updateOne(
        { _id: hotel_booked_id },
        { status: "cancle" },
        { new: true }
      );

      return this.sendJSONResponse(
        res,
        "Hotel cancled!",
        {
          length: 1
        },
        updated_result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
