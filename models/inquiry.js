const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const inquirySchema = new mongoose.Schema(
  {
    package_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    departure: {
      type: String,
      required: true
    },
    fullname: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    total_adult: {
      type: Number,
      required: true
    },
    total_child: {
      type: Number
      // required: true,
    },
    total_infants: {
      type: Number
      // required: true,
    },
    share_with: {
      type: String
      // required: true,
    },
    inquiry_date: {
      type: Date
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
