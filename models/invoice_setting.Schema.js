const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const invoice_setting_schema = new mongoose.Schema(
  {
    business_type: {
      type: String
    },
    organization_name: {
      type: String
    },
    first_name: {
      type: String
    },
    last_name: {
      type: String
    },
    email: {
      type: String
    },
    website_url: {
      type: String
    },
    addressline1: {
      type: String
    },
    addressline2: {
      type: String
    },
    country: {
      type: String
    },
    state: {
      type: String
    },
    city: {
      type: String
    },
    pincode: {
      type: Number
    },
    gstin: {
      type: String
    },
    is_invoice_wo_payment_links: {
      type: Boolean,
      default: false
    },
    invoice_logo: {
      type: String
    },
    digital_signature: {
      type: String
    },
    note: {
      type: String
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
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

invoice_setting_schema.plugin(aggregatePaginate);
invoice_setting_schema.plugin(mongoosePaginate);
const invoice_setting_Schema = new mongoose.model("invoice_setting", invoice_setting_schema);

module.exports = invoice_setting_Schema;
