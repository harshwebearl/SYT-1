const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const PolicySchema = new mongoose.Schema({
  policy_type: {
    type: String,
    required: true
  },
  policy_for: {
    type: String,
    required: true
  },
  policy_content: {
    type: String,
    required: true
  }
},{
  timestamps: {
    currentTime: () => getISTTime() // Use custom function for timestamps
  }
});

const policySchema = new mongoose.model("Policy", PolicySchema);
module.exports = policySchema;
