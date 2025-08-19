const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const Object1 = new mongoose.Schema({
  from_String: {
    type: String,
    required: true
  },
  to_String: {
    type: String,
    required: true
  }
});

const flight_commission_schema = new mongoose.Schema(
  {
    commission_name: {
      type: String,
      required: true
    },
    customer_group: {
      type: String,
      required: true
    },
    fare_type: {
      type: String,
      required: true
    },
    service_type: {
      type: String,
      required: true
    },
    airlines: {
      type: String,
      required: true
    },
    is_all_airlines: {
      type: Boolean,
      required: true
    },
    class: {
      type: String,
      required: true
    },
    is_all_class: {
      type: Boolean,
      required: true
    },
    is_all_segments: {
      type: Boolean,
      required: true
    },
    base_fare: {
      type: Boolean,
      required: true
    },
    total_fare: {
      type: Boolean,
      required: true
    },
    discount: {
      type: Boolean,
      required: true
    },
    markup_type: {
      type: String,
      required: true
    },
    segments: {
      type: Object1,
      required: true
    },
    yq: {
      type: Number,
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

flight_commission_schema.plugin(aggregatePaginate);
flight_commission_schema.plugin(mongoosePaginate);
const flight_commission_Schema = new mongoose.model("flight_commission", flight_commission_schema);

module.exports = flight_commission_Schema;
