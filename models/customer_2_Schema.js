const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const customer_2_schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    first_name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    dob: {
      type: String,
      required: true
    },
    gender: {
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
    anniversary: {
      type: String,
      required: true
    },
    email: {
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
    isd_code: {
      type: Number,
      required: true
    },
    mobile: {
      type: Number,
      required: true
    },
    pan_no: {
      type: String,
      required: true
    },
    gst_no: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    reference: {
      type: String,
      required: true
    },
    customer_type: {
      type: String,
      required: true,
      enum: ["b2c", "b2b", "b2e"]
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

customer_2_schema.plugin(aggregatePaginate);
customer_2_schema.plugin(mongoosePaginate);
const customer_2_Schema = new mongoose.model("customer_2", customer_2_schema);

module.exports = customer_2_Schema;
