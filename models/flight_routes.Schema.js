const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const flight_routes_schema = new mongoose.Schema(
  {
    flight_type: {
      type: String,
      required: true
    },
    from_flight: {
      type: String,
      required: true
    },
    to_flight: {
      type: String,
      required: true
    },
    from_flight_heading: {
      type: String,
      required: true
    },
    to_flight_heading: {
      type: String,
      required: true
    },
    img: {
      type: String,
      required: true
    },
    is_featured: {
      type: Boolean,
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

flight_routes_schema.plugin(aggregatePaginate);
flight_routes_schema.plugin(mongoosePaginate);
const flight_routes_Schema = new mongoose.model("flight_route", flight_routes_schema);

module.exports = flight_routes_Schema;
