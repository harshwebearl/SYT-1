const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const Transactionschema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    custom_requirement_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    bid_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    package_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    vendor_car_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    trnsaction_id: {
      type: String,
      required: true
    },
    status: {
      type: String
    },
    amount: {
      type: String,
      required: false
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

const TransactonSchema = new mongoose.model("transaction", Transactionschema);
module.exports = TransactonSchema;
