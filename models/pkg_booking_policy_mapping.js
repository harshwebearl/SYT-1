const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const pkg_booking_policy_mapping = new mongoose.Schema(
  {
    booking_policy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    packages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      }
    ],
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

pkg_booking_policy_mapping.plugin(aggregatePaginate);
pkg_booking_policy_mapping.plugin(mongoosePaginate);
const pkg_booking_policy_Mapping = new mongoose.model("pkg_booking_policy_mapping", pkg_booking_policy_mapping);

module.exports = pkg_booking_policy_Mapping;
