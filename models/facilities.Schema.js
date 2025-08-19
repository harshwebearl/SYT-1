const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}


const facilities_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    icon_img: {
      type: String
      // required: true
    },
    category_type: {
      type: mongoose.Schema.Types.ObjectId
      // required: true
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

facilities_schema.plugin(aggregatePaginate);
facilities_schema.plugin(mongoosePaginate);
const facilities_Schema = new mongoose.model("facilities", facilities_schema);

module.exports = facilities_Schema;
