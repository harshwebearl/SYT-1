const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const cms_pages = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    seo_url: {
      type: String,
      required: true
    },
    meta_keyword: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String
    },
    h1: {
      type: String
    },
    h2: {
      type: String
    },
    h3: {
      type: String
    },
    meta_description: {
      type: String
      // required: true
    },
    og_tag: {
      type: String
      // required: true
    },
    img_name: {
      type: String
      // required: true
    },
    img: {
      type: String
      // required: true
    },
    img_title: {
      type: String
      // required: true
    },
    alt_tag: {
      type: String
      // required: true
    },
    category_name: {
      type: String
      // required: true
    },
    overview: {
      type: String
      // required: true
    },
    is_featured: {
      type: Boolean
      // required: true
    },
    related_links: {
      type: [mongoose.Schema.Types.ObjectId]
      //   required: true
    },
    contents: [
      {
        _id: false,
        img_name: String,
        img: String,
        img_title: String,
        alt_tag: String,
        content: String
      }
    ],
    banners: [
      {
        _id: false,
        img_name: String,
        img: String,
        img_title: String,
        alt_tag: String
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

cms_pages.plugin(aggregatePaginate);
cms_pages.plugin(mongoosePaginate);

const cms_pages_schema = new mongoose.model("cms_pages", cms_pages);

module.exports = cms_pages_schema;
