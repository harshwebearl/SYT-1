const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const _timelineSchema = new mongoose.Schema(
  {
    title: {
      type: String
    },
    note: {
      type: String
    },
    //
    lead_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    created_by: {
      // type: mongoose.Schema.Types.ObjectId,
      type: String, //temp fix
      required: true
    },
    //
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

_timelineSchema.plugin(aggregatePaginate);
_timelineSchema.plugin(mongoosePaginate);
const timelineSchema = new mongoose.model("timeline", _timelineSchema);

module.exports = timelineSchema;
