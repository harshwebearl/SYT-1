const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    star: {
      type: String,
      required: true
    },
    book_package_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    comment_box: {
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

const ReviewSchema = new mongoose.model("review", reviewSchema);
module.exports = ReviewSchema;
