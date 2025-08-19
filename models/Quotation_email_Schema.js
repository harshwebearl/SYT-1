const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const Quotation_email_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email_subject: {
      type: String,
      required: true
    },
    member: {
      type: String,
      required: true
    },
    from_email: {
      type: String,
      required: true
    },
    cc_email: {
      type: String,
      required: true
    },
    email_body: {
      type: String,
      required: true
    },
    email_signature: {
      type: String,
      required: true
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

Quotation_email_schema.plugin(aggregatePaginate);
Quotation_email_schema.plugin(mongoosePaginate);
const quotation_email_schema = new mongoose.model("Quotation_email", Quotation_email_schema);

module.exports = quotation_email_schema;
