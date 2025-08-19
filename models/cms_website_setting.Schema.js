const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const cms_website_setting = new mongoose.Schema(
  {
    flight: {
      gst_number: Number,
      tcs_number: Number
    },
    hotel: {
      gst_number: Number,
      tcs_number: Number
    },
    hotel_last_cancellation_config: {
      no_of_days_before: Number,
      is_hold_booking: String
    },
    holiday: {
      gst_number: Number,
      tcs_number: Number
    },
    activities: {
      gst_number: Number,
      tcs_number: Number
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "deactive", "deleted"],
      default: "active"
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true
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

cms_website_setting.plugin(aggregatePaginate);
cms_website_setting.plugin(mongoosePaginate);
const cms_website_setting_schema = new mongoose.model("cms_website_setting", cms_website_setting);

module.exports = cms_website_setting_schema;
