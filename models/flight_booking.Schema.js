const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const onwards = new mongoose.Schema({
  airline: {
    type: String,
    required: true
  },
  flight_num: {
    type: String,
    require: true
  },
  airlines_img: {
    type: String,
    require: true
  },
  origin: {
    type: String,
    require: true
  },
  destination: {
    type: String,
    require: true
  },
  class: {
    type: String,
    require: true
  },
  stop: {
    type: String,
    require: true
  },
  from_date: {
    type: String,
    require: true
  },
  to_date: {
    type: String,
    require: true
  }
});

const fare_details = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  base_fare: {
    type: Number,
    require: true
  },
  other_tax: {
    type: Number,
    require: true
  },
  infant_tax: {
    type: Number,
    require: true
  },
  service_fee: {
    type: Number,
    require: true
  },
  total_fare: {
    type: Number,
    require: true
  },
  PNR: {
    type: String,
    require: true
  },
  seats: {
    type: Number,
    require: true
  }
});

const flight_booking = new mongoose.Schema(
  {
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    trip_type: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    meal: {
      type: Boolean,
      required: true
    },
    refundable: {
      type: String,
      required: true
    },
    fare_rule: {
      type: String,
      required: true
    },
    onward: {
      type: onwards,
      required: true
    },
    fare_detail: {
      type: fare_details,
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

flight_booking.plugin(aggregatePaginate);
flight_booking.plugin(mongoosePaginate);
const flight_booking_Schema = new mongoose.model("flight_booking", flight_booking);

module.exports = flight_booking_Schema;
