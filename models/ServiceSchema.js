const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const ServiceSchema = new mongoose.Schema({
  service_name: {
    type: String,
    required: true
  },
  
},{
  timestamps: {
    currentTime: () => getISTTime() // Use custom function for timestamps
  }
});

const serviceSchema = new mongoose.model("Service", ServiceSchema);
module.exports = serviceSchema;
