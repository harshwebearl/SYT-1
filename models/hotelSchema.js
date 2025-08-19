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
    seo_url: {
      type: String,
      required: true
    },
    no_of_stars: {
      type: Number,
      required: true
    },
    email: {
      type: String
      // required: true
    },
    contact_no: {
      type: Number
      // required: true
    },
    logo_image: {
      type: String
      // required: true
    },
    thumb_image: {
      type: String,
      required: true
    },
    banner_image: {
      type: String
      // required: true
    },
    address1: {
      type: String,
      required: true
    },
    address2: {
      type: String,
      required: true
    },
    landmark: {
      type: String
      // required: true
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
      // required: true
    },
    latitude: {
      type: Number
      // required: true
    },
    longitude: {
      type: Number
      // required: true
    },
    short_description: {
      type: String
      // required: true
    },
    long_description: {
      type: String
      // required: true
    },
    note: {
      type: String
      // required: true
    },
    gallery_images: {
      type: [
        {
          type: String
        }
      ]
      // required: true
    },
    amenities: {
      type: Array
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

hotel_schema.plugin(aggregatePaginate);
hotel_schema.plugin(mongoosePaginate);
const hotel_Schema = new mongoose.model("hotel", hotel_schema);

module.exports = hotel_Schema;
