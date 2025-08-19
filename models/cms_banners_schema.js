const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const cms_banners_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    heading: {
      type: String
    },
    image: {
      type: String,
      required: true
    },
    url: {
      type: String
    },
    description: {
      type: String
    },
    status: {
      type: String,
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
cms_banners_schema.plugin(aggregatePaginate);
cms_banners_schema.plugin(mongoosePaginate);
const cms_banners_Schema = new mongoose.model("cms_banners", cms_banners_schema);

module.exports = cms_banners_Schema;
