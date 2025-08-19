const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const Amenities_and_facilities = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    points: {
      type: Array,
      required: true
    },
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);
const Amenities_model = mongoose.model("Amenities_and_facilities", Amenities_and_facilities);
module.exports = Amenities_model;
