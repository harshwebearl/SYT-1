const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const currencies_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    purchase_price: {
      type: Number,
      required: true
    },
    selling_price: {
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
currencies_schema.plugin(aggregatePaginate);
currencies_schema.plugin(mongoosePaginate);

const currencies_Schema = new mongoose.model("currencie", currencies_schema);

module.exports = currencies_Schema;
