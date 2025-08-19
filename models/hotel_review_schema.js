const mongoose = require("mongoose");

function getISTTime() {
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
    const now = new Date();
    const istTime = new Date(now.getTime() + istOffset);
    return istTime;
  }

const hotel_review_schema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    star: {
        type: String,
        required: true
    },
    book_hotel_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    comment_box: {
        type: String,
        required: true
    }
}, {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  });


module.exports = mongoose.model("hotel_review_schema", hotel_review_schema)