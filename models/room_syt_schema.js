const mongoose = require("mongoose");
function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}
const room = new mongoose.Schema(
  {
    room_title: {
      type: String,
      required: true
    },
    photos: {
      type: Array,
      required: true
    },
    room_highlights: {
      type: Array,
      required: true
    },
    price_and_date: [
      {
        price_start_date: {
          type: Date
        },
        price_end_date: {
          type: Date
        },
        adult_price: {
          type: Number
        },
        child_price: {
          type: Number
        }
      }
    ],
    price: {
      type: Number
      // required: true
    },
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    total_rooms: {
      type: Number,
      required: true
    },
    othere_future_agency: {
      type: String
    },
    status: {
      type: String,
      enum: ["available", "booked", "sold"],
      default: "available"
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
const room_model = mongoose.model("room_syt", room);
module.exports = room_model;
