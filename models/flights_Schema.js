const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const flight_schema = new mongoose.Schema(
  {
    PNR: {
      type: String,
      required: true
    },
    airline: {
      type: String,
      required: true
    },
    customer: {
      type: String
      // required: true
    },
    origin: {
      type: String,
      required: true
    },
    destination: {
      type: String,
      required: true
    },
    purchased: {
      type: Number,
      required: true
    },
    markup: {
      type: String,
      required: true
    },
    sales_amt: {
      type: String,
      required: true
    },
    booking: {
      type: String,
      required: true
    },
    depart_dateTime: {
      type: String,
      required: true
    },
    status: {
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

flight_schema.plugin(aggregatePaginate);
flight_schema.plugin(mongoosePaginate);
const flight_Schema = new mongoose.model("flight", flight_schema);

module.exports = flight_Schema;
