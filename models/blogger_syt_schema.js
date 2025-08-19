const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const blogger_syt_schema = new mongoose.Schema(
  {
    blog_owner_name: {
      type: String,
      required: true
    },
    blog_owner_photo: {
      type: String,
      required: true
    },
    mobile_number: {
      type: Number,
      required: true
    },
    emai_id: {
      type: String,
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
    country: {
      type: String,
      required: true
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

const blogger_syt_model = mongoose.model("blogger_syt", blogger_syt_schema);

module.exports = blogger_syt_model;
