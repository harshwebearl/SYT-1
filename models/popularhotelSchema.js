const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const popular_hotel_schema = new mongoose.Schema(
  {
    destination_type: {
      // type: mongoose.Schema.Types.ObjectId,
      type: String,
      required: true
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    destination: {
      type: String,
      required: true
      //   default: false
    },
    header: {
      type: String,
      required: true
      //   default: false
    },
    sub_header: {
      type: String,
      required: true
      //   default: false
    },
    img: {
      type: String,
      required: true
      //   default: false
    },
    is_featured: {
      type: String,
      required: true
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

popular_hotel_schema.plugin(aggregatePaginate);
popular_hotel_schema.plugin(mongoosePaginate);
const popular_hotel_Schema = new mongoose.model("popular_hotel", popular_hotel_schema);

module.exports = popular_hotel_Schema;
