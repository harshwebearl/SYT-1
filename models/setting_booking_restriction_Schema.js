const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const setting_booking_restriction_schema = new mongoose.Schema(
  {
    no_of_booking: {
      type: Number,
      required: true
    },
    ip_address_list: {
      type: String,
      required: true
    },
    phone_list: {
      type: String,
      required: true
    },
    email_list: {
      type: String,
      required: true
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
      required: true
    },
    is_deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

setting_booking_restriction_schema.plugin(aggregatePaginate);
setting_booking_restriction_schema.plugin(mongoosePaginate);
const setting_booking_restriction_Schema = new mongoose.model(
  "setting_booking_restriction",
  setting_booking_restriction_schema
);

module.exports = setting_booking_restriction_Schema;
