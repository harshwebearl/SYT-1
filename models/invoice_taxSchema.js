const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const invoice_tax_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    percentage: {
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

invoice_tax_schema.plugin(aggregatePaginate);
invoice_tax_schema.plugin(mongoosePaginate);
const invoice_tax_Schema = new mongoose.model("invoice_tax", invoice_tax_schema);

module.exports = invoice_tax_Schema;
