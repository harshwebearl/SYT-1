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
  discount_percentage: {
    type: Number,
    required: true
  },
  from_day: {
    type: Number,
    required: true
  },
  to_day: {
    type: Number,
    required: true
  }
});

const dynamic_discounting_schema = new mongoose.Schema(
  {
    flight_types: {
      type: String,
      required: true
    },
    flight_from: {
      type: String,
      required: true
    },
    flight_to: {
      type: String,
      required: true
    },
    fare_types: {
      type: String,
      required: true
    },
    airlines: {
      type: String,
      required: true
    },
    dynamic_discounting: {
      type: Object1,
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

dynamic_discounting_schema.plugin(aggregatePaginate);
dynamic_discounting_schema.plugin(mongoosePaginate);
const dynamic_discounting_Schema = new mongoose.model("dynamic_discounting", dynamic_discounting_schema);

module.exports = dynamic_discounting_Schema;
