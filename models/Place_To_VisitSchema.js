const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}
const PlaceToVisitSchema = new mongoose.Schema({
  destination_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  photo: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
},{
  timestamps: {
    currentTime: () => getISTTime() // Use custom function for timestamps
  }
});

const placeToVisitSchema = new mongoose.model("Place_To_Visit", PlaceToVisitSchema);
module.exports = placeToVisitSchema;
