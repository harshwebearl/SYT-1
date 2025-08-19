const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const razor_pays = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },
  secret_key: {
    type: String,
    required: true
  }
});

const cc_avenues = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },
  access_code: {
    type: String,
    required: true
  },
  encryption_key: {
    type: String,
    required: true
  }
});

const setting_payment_gateway = new mongoose.Schema(
  {
    razor_pay: {
      type: razor_pays,
      required: true,
      default: null
    },
    cc_avenue: {
      type: cc_avenues,
      required: true,
      default: null
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

setting_payment_gateway.plugin(aggregatePaginate);
setting_payment_gateway.plugin(mongoosePaginate);
const setting_payment_gateway_Schema = new mongoose.model("setting_payment_gateway", setting_payment_gateway);

module.exports = setting_payment_gateway_Schema;
