const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const _counterSchema = new mongoose.Schema({
  _id: {
    db: {
      type: String,
      required: true
    },
    coll: {
      type: String,
      required: true
    }
  },
  seq_value: {
    type: Number,
    required: true
  }
}, {
  timestamps: {
    currentTime: () => getISTTime() // Use custom function for timestamps
  }
});

const CounterSchema = new mongoose.model("counter", _counterSchema);
module.exports = CounterSchema;
