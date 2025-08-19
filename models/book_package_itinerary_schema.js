const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const bookpackage_itineraryschema = new mongoose.Schema({
  book_package_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  day: {
    type: Number,
    required: true
  },
  hotel: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  activity: {
    type: String,
    required: true
  },
  bid_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  custom_package_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  itinery_date: {
    type: Date,
    required: true
  }
},
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }

  }
);

const book_package_itinerary_schema = new mongoose.model("book_package_itinerary", bookpackage_itineraryschema);
module.exports = book_package_itinerary_schema;
