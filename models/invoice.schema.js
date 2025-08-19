const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}
// const customerObject = new mongoose.Schema({

// },{_id:false})
const Object1 = new mongoose.Schema({
  item_description: {
    type: String
  },
  item_hsnsac: {
    type: String
  },
  item_quantity: {
    type: Number
  },
  item_rate: {
    type: Number
  },
  item_amount: {
    type: Number
  },
  taxes: [{ label: String, value: Number }]
});

const invoice_schema = new mongoose.Schema(
  {
    title: {
      type: String
    },
    invoice_no: {
      type: Number
    },
    issue_date: {
      type: Date
    },
    due_date: {
      type: Date
    },
    description: {
      type: String
    },
    currency: {
      type: String //fa fa-inr
    },
    from_name: {
      type: mongoose.Schema.Types.Mixed
    },
    addressline1: {
      type: String
    },
    addressline2: {
      type: String
    },
    to_customer: {
      type: mongoose.Schema.Types.Mixed
    },
    customer: {
      type: mongoose.Schema.Types.Mixed
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId
    },
    items: {
      type: [Object1]
    },
    note: {
      type: String
    },
    sub_total: Number,
    tax_total: Number,
    total_amount: Number,
    received_amount: Number,
    net_amount: Number,
    signature_img: String,
    payment_details: [{ date: Date, amount_received: Number, mode: String, remarks: String }],
    status: {
      type: String,
      // required: true,
      default: "draft",
      enum: ["draft", "paid", "unpaid", "overdue", "completed"]
    },
    lead_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      require: true
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

invoice_schema.plugin(aggregatePaginate);
invoice_schema.plugin(mongoosePaginate);
const Invoice_Schema = new mongoose.model("invoice", invoice_schema);

module.exports = Invoice_Schema;
