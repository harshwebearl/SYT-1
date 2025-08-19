const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}
const property_policies = new mongoose.Schema(
  {
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    policy_title: {
      type: String,
      required: true
    },
    policy_description: {
      type: String,
      required: true
    },
    infant: {
      type: String,
      required: true
    },
    children: {
      type: String,
      required: true
    },
    adult_and_above: {
      type: String,
      required: true
    },
    infant_points: {
      type: Array,
      required: true
    },
    childern_points: {
      type: Array,
      required: true
    },
    adult_and_above_points: {
      type: Array,
      required: true
    },
    policy_other: {
      type: Array,
      required: true
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);
const property_policies_schema = mongoose.model("property_policies", property_policies);
module.exports = property_policies_schema;
