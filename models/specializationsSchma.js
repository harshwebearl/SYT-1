const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const specializations_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    header: {
      type: String,
      required: true
      //   default: false
    },
    seo_url: {
      type: String,
      required: true
      //   default: false
    },
    seo_title: {
      type: String,
      required: true
      //   default: false
    },
    meta_keyword: {
      type: String,
      required: true
      //   default: false
    },
    meta_description: {
      type: String,
      required: true
      //   default: false
    },
    og_tag: {
      type: String,
      required: true
      //   default: false
    },
    img: {
      type: String,
      required: true
      //   default: false
    },
    description: {
      type: String,
      required: true
      //   default: false
    },
    is_featured: {
      type: Boolean,
      required: true
      //   default: false
    },
    is_destination: {
      type: Boolean,
      required: true
      //   default: false
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

specializations_schema.plugin(aggregatePaginate);
specializations_schema.plugin(mongoosePaginate);
const specializations_Schema = new mongoose.model("specialization", specializations_schema);

module.exports = specializations_Schema;
