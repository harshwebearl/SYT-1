const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const business_type = new mongoose.Schema({
  business_type: {
    type: String,
    required: true
  }
},
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  });
const business_type_model = mongoose.model("business_type", business_type);
module.exports = business_type_model;
