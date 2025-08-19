const mongoose = require("mongoose");
function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}
const room = new mongoose.Schema(
  {
    agency_id: {
      type: mongoose.Schema.Types.ObjectId
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
        extra_bad: {
          type: Number
        }
      }
    ],
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    othere_future_agency: {
      type: String
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);
const room_model = mongoose.model("room_price", room);
module.exports = room_model;
