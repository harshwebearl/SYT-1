const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");


function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const hotel_schema = new mongoose.Schema(
  {
    hotel_type: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    phone: {
      type: Number
    },
    email: {
      type: String
    },
    country: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    pincode: {
      type: Number
    },
    price: {
      type: Number
    },
    address: {
      type: String
    },
    description: {
      type: String
    },
    termsnconditions: {
      type: String
    },
    images: {
      type: [
        {
          type: String
        }
      ]
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

hotel_schema.plugin(aggregatePaginate);
hotel_schema.plugin(mongoosePaginate);
const hotel_Schema = new mongoose.model("pkg_hotel", hotel_schema);

module.exports = hotel_Schema;
