const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");


function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const cms_destination_related_packages = new mongoose.Schema(
  {
    destination_id: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
      required: true
    },
    packages: {
      type: mongoose.Schema.Types.ObjectId,
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

cms_destination_related_packages.plugin(aggregatePaginate);
cms_destination_related_packages.plugin(mongoosePaginate);
const cms_destination_related_packages_Schema = new mongoose.model(
  "cms_destination_related_packages",
  cms_destination_related_packages
);

module.exports = cms_destination_related_packages_Schema;
