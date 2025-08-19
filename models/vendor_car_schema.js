const mongoose = require("mongoose");
const Schema = mongoose.Schema;

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const VendorCarSchema = new Schema(
  {
    car_id: {
      type: mongoose.Types.ObjectId
    },
    vendor_id: {
      type: mongoose.Types.ObjectId
    },
    car_condition: {
      type: String
    },
    model_year: {
      type: Number
    },
    insurance: {
      type: Boolean
    },
    photos: {
      type: [String]
    },
    registration_number: {
      type: String
    },
    color: {
      type: String
    },
    price_per_km: {
      type: Number
    },
    min_price_per_day: {
      type: Number
    },
    pincode: {
      type: Number
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    outStateAllowed: {
      type: Boolean
    },
    AC: {
      type: Boolean
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

module.exports = mongoose.model("VendorCar", VendorCarSchema);
