const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const hotel_itienrary_schema = new mongoose.Schema(
  {
    agency_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    hotel_name: {
      type: String
    },
    hotel_address: {
      type: String,
      required: true
    },
    hotel_photo: {
      type: Array
    },
    hotel_type: {
      type: String
      // required: true
    },
    hotel_city: {
      type: String,
      required: true
    },
    hotel_state: {
      type: String,
      required: true
    },
    hotel_description: {
      type: String
    },
    other: {
      type: String
    },
    lunch_price: {
      type: Number
    },
    dinner_price: {
      type: Number
    },
    breakfast_price: {
      type: Number
    },
    lunch: {
      type: Boolean
    },
    dinner: {
      type: Boolean
    },
    breakfast: {
      type: Boolean
    },
    rooms: [
      {
        room_type: {
          type: String
        },
        room_type_price: {
          type: Number
        }
      }
    ]
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

module.exports = mongoose.model("hotel_itienrary", hotel_itienrary_schema);
