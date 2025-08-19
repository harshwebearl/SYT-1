const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const user_schema = new mongoose.Schema(
  {
    phone: {
      type: Number,
      required: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'agency', 'customer', 'member']
    },
    subrole_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    // pin:{
    //   type:Number
    // },
    status: {
      type: String
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

const userschema = new mongoose.model("users", user_schema);

module.exports = userschema;
