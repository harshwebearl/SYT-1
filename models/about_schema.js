const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const about_schema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: {
    currentTime: () => getISTTime() // Use custom function for timestamps
  }
});

const about_model = mongoose.model("about", about_schema);

module.exports = about_model;
