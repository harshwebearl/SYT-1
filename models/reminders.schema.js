const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const _reminderSchema = new mongoose.Schema(
  {
    remind_before: {
      type: Number
    },
    type: {
      type: String,
      enum: ["internal", "external"]
    },
    reminder_date: {
      type: Date
    },
    reminder_via: {
      type: String,
      enum: ["sms", "email", "call"]
    },
    reminder_hh: {
      type: Number
    },
    reminder_mm: {
      type: Number
    },
    reminder_period: {
      type: String,
      enum: ["AM", "PM"]
    },
    reminder_note: {
      type: String
    },
    //
    lead_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    created_by: {
      // type: mongoose.Schema.Types.ObjectId,
      type: String, //temp fix
      required: true
    },
    invoice_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    supplier_payment_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    //
    status: {
      type: String,
      default: "scheduled",
      enum: ["scheduled", "executed", "cancelled"]
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

_reminderSchema.plugin(aggregatePaginate);
_reminderSchema.plugin(mongoosePaginate);
const reminderSchema = new mongoose.model("reminder", _reminderSchema);

module.exports = reminderSchema;
