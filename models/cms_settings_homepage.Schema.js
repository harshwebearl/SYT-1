const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const header = new mongoose.Schema({
  header: {
    type: String
  },
  subtitle: {
    type: String
  },
  sequenceNum: {
    type: Number
  }
});

const cms_settings_homepage = new mongoose.Schema(
  {
    welcome_header: {
      type: String
    },
    favicon_img: {
      type: String
    },
    logo_img: {
      type: String
    },
    testimonial_banner_text: {
      type: String
    },
    testimonial_banner_img: {
      type: String
    },
    testimonial_background_img: {
      type: String
    },
    description: {
      type: String
      // required: true
    },
    structured_data_markup: {
      type: String
      // required: true
    },
    social_markup: {
      type: String
      // required: true
    },
    analytics: {
      type: String
      // required: true
    },
    remarketing: {
      type: String
      // required: true
    },
    og_tag: {
      type: String
      // required: true
    },
    headers: {
      type: [header],
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "deactive", "deleted"],
      default: "active"
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
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

cms_settings_homepage.plugin(aggregatePaginate);
cms_settings_homepage.plugin(mongoosePaginate);
const cms_settings_homepage_schema = new mongoose.model("cms_settings_homepage", cms_settings_homepage);

module.exports = cms_settings_homepage_schema;
