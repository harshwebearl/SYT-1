const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const notificationschema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    user_type: {
      type: String,
      required: true
    },
    // id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true
    // },
    status: {
      type: String,
      default: "unread"
    },
    date_and_time: {
      type: Date,
      default: getISTTime()
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

const Notificationschema = new mongoose.model("Notification", notificationschema);
module.exports = Notificationschema;
