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

const AdminSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true
  },
  // mobile_number: {
  //   type: Number
  // },
  email_address: {
    type: String,
    required: true
  },
  // password: {
  //   type: String,
  //   required: true
  // },
  admin_status: {
    type: Boolean,
    required: true, //1=super_admin 0 = admin //super_admin can not delete
    default: false
  },
  // status: {
  //   type: Boolean,
  //   required: true, //0=block,1=active
  //   default: 1
  // },
  isProfilecompleted: {
    type: Boolean,
    default: false
  },
  notificationTokens: {
    type: notificationObj,
    default: null
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId
  }
}, {
  timestamps: {
    currentTime: () => getISTTime() // Use custom function for timestamps
  }
});

const adminSchema = new mongoose.model("Admin", AdminSchema);
module.exports = adminSchema;
