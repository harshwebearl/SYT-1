const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const bulk_followup_schema = new mongoose.Schema(
  {
    lead_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    phone: {
      type: Number,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    allocated_to: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    source: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    stage: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    email_send_on: {
      type: String,
      required: true
    },
    no_of_email_send: {
      type: Number,
      required: true
    },
    sms_sent_on: {
      type: String,
      required: true
    },
    no_of_sms_sent: {
      type: Number,
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

bulk_followup_schema.plugin(aggregatePaginate);
bulk_followup_schema.plugin(mongoosePaginate);
const bulk_followup_Schema = new mongoose.model("bulk_followup", bulk_followup_schema);

module.exports = bulk_followup_Schema;
