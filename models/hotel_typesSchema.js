const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const hotel_type_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    stars: {
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

hotel_type_schema.plugin(aggregatePaginate);
hotel_type_schema.plugin(mongoosePaginate);
const hotel_type_Schema = new mongoose.model("hotel_type", hotel_type_schema);

module.exports = hotel_type_Schema;
