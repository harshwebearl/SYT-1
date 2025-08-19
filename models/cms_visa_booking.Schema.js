const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const booking_details = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  citizenship: {
    type: String,
    required: true
  },
  residency: {
    type: String,
    required: true
  },
  dob: {
    type: String,
    required: true
  },
  birth_place: {
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
  home_address: {
    type: String,
    required: true
  },
  postal_code: {
    type: Number,
    required: true
  },
  mobile: {
    type: Number,
    required: true
  },
  employment_status: {
    type: String,
    required: true
  },
  passport_num: {
    type: String,
    required: true
  },
  passport_issue_date: {
    type: Date,
    required: true
  },
  passport_issue_authority: {
    type: String,
    required: true
  },
  passport_front_file_path: {
    type: String,
    required: true
  },
  passport_back_file_path: {
    type: String,
    required: true
  },
  file_photo_path: {
    type: String,
    required: true
  },
  departure: {
    type: String,
    required: true
  },
  invoice: {
    type: String,
    required: true
  },
  additional_document: {
    type: String,
    required: true
  }
});

const cms_visa_booking_schema = new mongoose.Schema(
  {
    visa_status: {
      type: String,
      required: true,
      enum: ["requestInProgress", "verificationInProcess", "verificationCompleted", "verificationFailed", "visaAlloted"]
    },
    booking_details: {
      type: booking_details,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "deactive", "deleted"],
      default: "active"
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    is_deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

cms_visa_booking_schema.plugin(aggregatePaginate);
cms_visa_booking_schema.plugin(mongoosePaginate);
const cms_visa_booking_Schema = new mongoose.model("cms_visa_booking", cms_visa_booking_schema);

module.exports = cms_visa_booking_Schema;
