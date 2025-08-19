const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const notificationObj = new mongoose.Schema(
  {
    deviceType: {
      type: String,
      enum: ["ios", "android", "web"],
      // default: "ios",
      required: true
    },
    deviceToken: {
      type: String,
      required: true
    },
    lastUpdatedOn: {
      type: Date,
      required: true
    }
  },
  {
    _id: false
  }
);

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email_address: {
    type: String,
    required: true
  },
  // mobile_number: {
  //   type: String,
  //   required: true
  // },
  // password: {
  //   type: String,
  //   required: true
  // },
  referal_code: {
    type: String
  },
  gender: {
    type: String,
    required: true // 1=male, 0=female, 3=other
  },
  photo: {
    type: String,
    default: "defualt_image.png",
    required: false,
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  address: {
    type: String
    // required: true
  },
  // status: {
  //   type: String, // 1=active,0=block
  //   default: 1
  // },
  status_change_by: {
    type: String
    // admin_id/user_id when change the status
  },
  isProfilecompleted: {
    type: Boolean,
    default: false
  },
  notificationTokens: {
    type: notificationObj,
    default: null
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
}, {
  timestamps: {
    currentTime: () => getISTTime() // Use custom function for timestamps
  }
});

const userSchema = new mongoose.model("customer", UserSchema);
module.exports = userSchema;
