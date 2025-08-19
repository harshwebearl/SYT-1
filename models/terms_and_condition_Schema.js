const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const termandconditionSchema = new mongoose.Schema({
  term_and_condition_type: {
    type: String,
    required: true
  },
  term_and_condition_for: {
    type: String,
    required: true
  },
  term_and_condition_content: {
    type: String,
    required: true
  }
},{
  timestamps: {
    currentTime: () => getISTTime() // Use custom function for timestamps
  }
});

const term_and_condition_Schema = new mongoose.model("termsandcondition", termandconditionSchema);
module.exports = term_and_condition_Schema;
