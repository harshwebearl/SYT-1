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
  lto15days: {
    type: Number,
    required: true
  },
  _15to30days: {
    type: Number,
    require: true
  },
  _30to45days: {
    type: Number,
    require: true
  },
  gt45days: {
    type: Number,
    require: true
  },
  description: {
    type: String,
    require: true
  }
});

const Object2 = new mongoose.Schema({
  lto15days: {
    type: Number,
    require: true
  },
  _15to30days: {
    type: Number,
    require: true
  },
  _30to45days: {
    type: Number,
    require: true
  },
  gt45days: {
    type: Number,
    require: true
  },
  description: {
    type: String,
    require: true
  }
});

const booking_policies_schema = new mongoose.Schema(
  {
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    packages: [
      {
        value: String,
        label: String
        // required: true
      }
    ],
    booking_policy: {
      //   name: String,
      //  control_type:String
      type: Object1,
      default: null
    },
    cancellation_policy: {
      //   name: String,
      //  control_type:String
      type: Object2,
      default: null
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

booking_policies_schema.plugin(aggregatePaginate);
booking_policies_schema.plugin(mongoosePaginate);
const booking_policies_Schema = new mongoose.model("booking_policies", booking_policies_schema);

module.exports = booking_policies_Schema;
