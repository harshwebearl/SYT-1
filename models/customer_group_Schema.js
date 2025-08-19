const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const customer_group_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    customers_list: {
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

customer_group_schema.plugin(aggregatePaginate);
customer_group_schema.plugin(mongoosePaginate);
const customer_group_Schema = new mongoose.model("customer_group", customer_group_schema);

module.exports = customer_group_Schema;
