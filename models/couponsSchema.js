const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const coupons_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    for: {
      type: String,
      //global:-hotel,package,acitivity
      //nonglobal:- airline
      required: true
    },
    code: {
      type: String,
      required: true
    },
    lower_amount_limit: {
      type: Number,
      required: true
    },
    upper_amount_limit: {
      type: Number,
      required: true
    },
    discount_type: {
      type: String,
      required: true
    },
    discount_value: {
      type: Number,
      required: true
    },
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true
    },
    per_user_use_limit: {
      type: Number,
      required: true
    },
    airline: {
      type: String
      // required: true
    },
    is_discount_on_markup: {
      type: Boolean
      // required: true
    },
    users_list: {
      type: mongoose.Schema.Types.ObjectId
      // required: true
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

coupons_schema.plugin(aggregatePaginate);
coupons_schema.plugin(mongoosePaginate);
const coupons_Schema = new mongoose.model("coupons", coupons_schema);

module.exports = coupons_Schema;
