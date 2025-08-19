const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const source_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String
    },
    contact_no: {
      type: Number
    },
    address_1: {
      type: String
    },
    address_2: {
      type: String
    },
    country: {
      type: String
    },
    state: {
      type: String
    },
    city: {
      type: String
    },
    pin_code: {
      type: String
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

source_schema.plugin(aggregatePaginate);
source_schema.plugin(mongoosePaginate);
const source_Schema = new mongoose.model("source", source_schema);

module.exports = source_Schema;
