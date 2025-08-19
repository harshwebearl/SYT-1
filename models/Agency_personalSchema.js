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

const AgencyPersonalSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true
    },
    mobile_number: {
      type: Number,
      required: true
    },
    email_address: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    pincode: {
      type: Number,
      required: true
    },
    agency_name: {
      type: String,
      required: true
    },
    business_type: {
      type: String,
      required: true
    },

    agency_logo: {
      type: String
      // default: []
      // required: true
    },
    agency_address: {
      type: String,
      default: ""
      // required: true
    },
    GST_NO: {
      type: String,
      default: ""
      // required: true
    },
    website: {
      type: String,
      default: ""
      // required: true
    },
    IATA: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["active", "block", "delete", "inactive"],
      default: "active"
      // required: true // 1=actice,2=block,3=delete,0=deactive
    },
    status_change_by: {
      type: String, // admin_id/agency_id when change the status
      default: ""
    },

    notificationTokens: {
      type: notificationObj
      // default: null //this is creating collision of data type when exporting the collection in json from mongocompass
    },
    user_id: {
      ref: "users",
      type: mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

const agencySchema = new mongoose.model("AgencyPersonal", AgencyPersonalSchema);
module.exports = agencySchema;
