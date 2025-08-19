const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const supplier_payment_schema = new mongoose.Schema(
  {
    // SCHEDULE
    service: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    due_date: {
      type: Date,
      required: true
    },
    sub_total: {
      type: Number,
      // type: mongoose.Schema.Types.Decimal128,
      required: true
    },
    taxes: [{ label: String, value: Number }],
    tax_total: {
      type: Number,
      required: true
    },
    total_amount: {
      type: Number,
      required: true
    },
    paid_amount: {
      type: Number,
      required: true
    },
    pending_amount: {
      type: Number,
      required: true
    },
    description: String,

    // RELEASE
    release_payment_remark: String,
    release_payment_gst_no: String,
    release_payment_pan_no: String,
    release_payment_invoice_no: String,
    release_payment_po_no: String,
    release_payment_voucher_no: String,
    release_payment_payment_mode: String,
    document: String,
    is_ITC: {
      type: Boolean,
      default: false
    },
    customer: {
      type: mongoose.Schema.Types.Mixed
    },
    status: {
      type: String,
      // required: true,
      default: "draft",
      enum: ["draft", "paid", "unpaid", "overdue", "completed"]
    },
    lead_id: {
      type: mongoose.Schema.Types.ObjectId,
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

supplier_payment_schema.plugin(aggregatePaginate);
supplier_payment_schema.plugin(mongoosePaginate);
const supplier_payment_Schema = new mongoose.model("supplier_payment", supplier_payment_schema);

module.exports = supplier_payment_Schema;
