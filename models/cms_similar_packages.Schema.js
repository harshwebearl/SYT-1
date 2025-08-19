const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const cms_similar_packages_schema = new mongoose.Schema(
  {
    package_id: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
      required: true
    },
    similar_packages_list: [{ type: mongoose.Schema.Types.ObjectId }],
    status: {
      type: String,
      enum: ["active", "deleted", "deactive"],
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
cms_similar_packages_schema.plugin(aggregatePaginate);
cms_similar_packages_schema.plugin(mongoosePaginate);

const cms_similar_packages_Schema = new mongoose.model("cms_similar_packages", cms_similar_packages_schema);

module.exports = cms_similar_packages_Schema;
