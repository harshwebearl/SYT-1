const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const hotel = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    hotel_name: {
      type: String,
      required: true
    },
    hotel_address: {
      type: String,
      required: true
    },
    hotel_description: {
      type: String,
      required: true
    },
    hotel_highlights: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      }
    ],
    hotel_photo: {
      type: Array,
      required: true
    },
    hotel_type: {
      type: Number,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    other: {
      type: Array,
      required: true
    },
    status: {
      type: String,
      default: "pending"
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
const hotel_model = mongoose.model("hotel_syt", hotel);

module.exports = hotel_model;
