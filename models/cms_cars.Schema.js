const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const cms_cars_schema = new mongoose.Schema(
  {
    gear_type: {
      type: Boolean,
      default: false
      // indicates true for auto, false for manual
      // required: true
    },
    // for gear_type ===auto
    total_dist_for_one_way_trip: {
      type: Number
    },
    price_per_km_for_one_trip: {
      type: Number
    },
    fix_traiff_dist: {
      type: Number
    },
    discount_type: {
      type: String
    },
    total_dist_for_round_trip: {
      type: Number
    },
    price_per_km_for_round_trip: {
      type: Number
    },
    tax: {
      type: Number
    },
    discount: {
      type: Number
    },
    //
    name: {
      type: String,
      required: true
    },
    img: {
      type: String
    },
    location_from: {
      type: String,
      required: true
    },
    location_to: {
      type: String,
      required: true
    },
    video_url: {
      type: String
    },
    price: {
      type: Number,
      required: true
    },
    car_type: {
      type: String,
      required: true
    },
    trip_type: {
      type: String
    },
    category: {
      type: String,
      required: true
    },
    inclusions: {
      type: [String]
    },
    exclusions: {
      type: [String]
    },
    facilities: {
      type: String
    },
    banners: [
      {
        img_name: String,
        alt_tag: String,
        img: String,
        description: String
      }
    ],
    status: {
      type: String,
      required: true,
      enum: ["active", "deactive", "deleted"],
      default: "active"
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

cms_cars_schema.plugin(aggregatePaginate);
cms_cars_schema.plugin(mongoosePaginate);
const cms_cars_Schema = new mongoose.model("cms_cars", cms_cars_schema);

module.exports = cms_cars_Schema;
