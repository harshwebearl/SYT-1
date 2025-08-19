const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const cms_aboutus_schema = new mongoose.Schema(
  {
    header: {
      type: String
    },
    banner_text: {
      type: String
    },
    partner_header: {
      type: String
    },
    banner_img: {
      type: String
    },
    partner_images: [
      {
        type: String
      }
    ],
    description: {
      type: String
    },
    status: {
      type: String,
      enum: ["active", "deleted", "deactive"],
      default: "active"
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      // unique: true,
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
cms_aboutus_schema.plugin(aggregatePaginate);
cms_aboutus_schema.plugin(mongoosePaginate);
const cms_aboutus_Schema = new mongoose.model("cms_aboutus", cms_aboutus_schema);

module.exports = cms_aboutus_Schema;
