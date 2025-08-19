const mongoose = require("mongoose");
function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const DestinationSchema = new mongoose.Schema({
  destination_name: {
    type: String,
    unique: true,
    trim: true,
    required: true
  },
  destination_category_id: [{ type: mongoose.Schema.Types.ObjectId }],
  how_to_reach: {
    type: String,
    required: true
  },
  about_destination: {
    type: String,
    required: true
  },
  best_time_for_visit: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: 1 //1=active,0=block
  },
  most_loved_destionation: {
    type: Boolean,
    default: false
  }
},{
  timestamps: {
    currentTime: () => getISTTime() // Use custom function for timestamps
  }
});

const destinationSchema = new mongoose.model("Destination", DestinationSchema);
module.exports = destinationSchema;
