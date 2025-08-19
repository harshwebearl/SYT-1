const mongoose = require("mongoose");
function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}
const Subscribe_Syt = new mongoose.Schema(
  {
    Emailid: {
      type: String,
      required: true
    },
    Userid: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);
const Subscribe_Syt_model = mongoose.model("Subscribe_Syt", Subscribe_Syt);
module.exports = Subscribe_Syt_model;
