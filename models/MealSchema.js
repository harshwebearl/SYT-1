const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const MealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
}, {
  timestamps: {
    currentTime: () => getISTTime() // Use custom function for timestamps
  }
});

const mealSchema = new mongoose.model("meal", MealSchema);
module.exports = mealSchema;
