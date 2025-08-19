const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const ItinerarySchema = new mongoose.Schema(
  {
    package_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    title: {
      type: String,
      required: true
    },
    day: {
      type: Number,
      required: true
    },
    activity: {
      type: String,
      required: true
    },
    photo: {
      type: String
      // required: true
    },
    hotel_name: {
      type: String
      // required: true
    },
    bid_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    hotel_itienrary_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    lunch_price: {
      type: Number
    },
    dinner_price: {
      type: Number
    },
    breakfast_price: {
      type: Number
    },
    lunch: {
      type: Boolean
    },
    dinner: {
      type: Boolean
    },
    breakfast: {
      type: Boolean
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

const itinerarySchema = new mongoose.model("Itinery", ItinerarySchema);
module.exports = itinerarySchema;
