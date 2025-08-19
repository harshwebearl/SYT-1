const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const cancle_booking = new mongoose.Schema(
  {
    hotel_booked_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    cancle_policy_status: {
      type: Boolean,
      required: true
    },
    date_time: {
      type: Date,
      require: true
    },
    user_id: {
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
const cancle_booking_schema = mongoose.model("cancle_booking", cancle_booking);
module.exports = cancle_booking_schema;
