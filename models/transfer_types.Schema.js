const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const transfer_types_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    is_source: {
      type: Boolean
      //   default: false
    },
    is_destination: {
      type: Boolean
      //   default: false
    },
    is_vehicle_type: {
      type: Boolean
      //   default: false
    },
    is_vehicle_name: {
      type: Boolean
      //   default: false
    },
    is_remarks: {
      type: Boolean
      //   default: false
    },
    is_units: {
      type: Boolean
      //   default: false
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

transfer_types_schema.plugin(aggregatePaginate);
transfer_types_schema.plugin(mongoosePaginate);
const transfer_types_Schema = new mongoose.model("transfer_type", transfer_types_schema);

module.exports = transfer_types_Schema;
