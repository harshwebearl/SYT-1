const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const booking_details = new mongoose.Schema({
  customer_name: {
    type: String,
    required: true
  },
  customer_email: {
    type: String,
    required: true
  },
  customer_phone: {
    type: Number,
    required: true
  },
  check_in: {
    type: Date,
    required: true
  },
  check_out: {
    type: Date,
    required: true
  },
  hotel_name: {
    type: String,
    required: true
  },
  invoice: {
    type: String,
    required: true
  },
  voucher: {
    type: String,
    required: true
  },
  total_amount: {
    type: Number,
    required: true
  }
});

const lead_pax_details = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  }
});

const hotel_booking = new mongoose.Schema(
  {
    booking_detail: {
      type: booking_details
    },
    lead_pax_detail: {
      type: lead_pax_details
    },
    customer_id: {
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

hotel_booking.plugin(aggregatePaginate);
hotel_booking.plugin(mongoosePaginate);
const hotel_booking_schema = new mongoose.model("hotel_booking", hotel_booking);

module.exports = hotel_booking_schema;
