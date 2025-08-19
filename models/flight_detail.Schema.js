const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const flight_details_schema = new mongoose.Schema(
  {
    Booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    customer_email: {
      type: String,
      required: true
    },
    customer_mobile: {
      type: Number,
      required: true
    },
    booking_amount: {
      type: Number,
      required: true
    },
    airline_name: {
      type: String,
      required: true
    },
    booking_date: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    refund_status: {
      type: String,
      required: true
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
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

flight_details_schema.plugin(aggregatePaginate);
flight_details_schema.plugin(mongoosePaginate);
const flight_details_Schema = new mongoose.model("flight_detail", flight_details_schema);

module.exports = flight_details_Schema;
