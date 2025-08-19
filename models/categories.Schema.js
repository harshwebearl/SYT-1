const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const categories_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    header: {
      type: String,
      required: true
    },
    seo_url: {
      type: String,
      required: true
    },
    seo_title: {
      type: String,
      required: true
    },
    meta_keyword: {
      type: String,
      required: true
    },
    meta_description: {
      type: String,
      required: true
    },
    og_tag: {
      type: String,
      required: true
    },
    img: {
      type: String
      // required: true temporay
    },
    description: {
      type: String,
      required: true
    },
    is_featured: {
      type: Boolean,
      default: false
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
categories_schema.plugin(aggregatePaginate);
categories_schema.plugin(mongoosePaginate);
const categories_Schema = new mongoose.model("categories", categories_schema);

module.exports = categories_Schema;
