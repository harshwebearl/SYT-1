const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const SafetyinfoSchema = new mongoose.Schema({
  safetyinfo_photo: {
    type: String,
    required: true
  },
  safetyinfo_title: {
    type: String,
    required: true
  },
  description_id: {
    type: mongoose.Types.ObjectId,
    required: true
  }
},{
  timestamps: {
    currentTime: () => getISTTime() // Use custom function for timestamps
  }
});

const SafetyInfo = new mongoose.model("safetyinfo", SafetyinfoSchema);
module.exports = SafetyInfo;
