const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const cms_destination = new mongoose.Schema(
  {
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
    meta_keyword: {
      type: String
    },
    seo_title: {
      type: String
    },
    currency: {
      type: String
    },
    time_zone: {
      type: String
    },
    time_title: {
      type: String
    },
    image: {
      type: String,
      required: true
    },
    meta_description: {
      type: String
    },
    og_tag: {
      type: String
    },
    description: {
      type: String
    },
    is_featured: {
      type: Boolean
    },
    banners: [
      {
        name: {
          type: String
        },
        img: {
          type: String
        }
      }
    ],
    contents: [
      {
        month: {
          type: String
        },
        title: {
          type: String
        },
        festival: {
          type: String
        }
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

cms_destination.plugin(aggregatePaginate);
cms_destination.plugin(mongoosePaginate);
const cms_destination_schema = new mongoose.model("cms_destination", cms_destination);

module.exports = cms_destination_schema;
