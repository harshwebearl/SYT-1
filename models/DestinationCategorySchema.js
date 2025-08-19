const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const DestinationCategorySchema = new mongoose.Schema(
  {
    category_name: {
      type: String,
      required: true
    },
    photo: {
      type: String,
      required: true
    },
    status: {
      type: Boolean,
      default: 1 //1=active,0=block
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

const destinationCategorySchema = new mongoose.model("Destination_Category", DestinationCategorySchema);
module.exports = destinationCategorySchema;
