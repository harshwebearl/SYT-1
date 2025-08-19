const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const hotel_booking = new mongoose.Schema(
  {
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    transaction_id: {
      type: String
    },
    total_booked_rooms: {
      type: Number,
      required: true
    },
     gst_price: {
      type: Number,
      default: 0
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    check_in_date: {
      type: Date,
      require: true
    },
    check_out_date: {
      type: Date,
      require: true
    },
    date_time: {
      type: Date,
      default: getISTTime,
      require: true
    },
    total_adult: {
      type: Number,
      require: true
    },
    total_child: {
      type: Number,
      require: true
    },
    payment_type: {
      type: String,
      require: true
    },
    status: {
      type: String,
      require: true
    },
    room_title: {
      type: String,
      require: true
    },
    price: {
      type: Number,
      require: true
    },
    user_name: {
      type: String,
      require: true
    },
    gender: {
      type: String,
      require: true
    },
    country: {
      type: String,
      require: true
    },
    state: {
      type: String,
      require: true
    },
    city: {
      type: String,
      require: true
    },
    dob: {
      type: String,
      require: true
    },
    contact_no: {
      type: Number,
      require: true
    },
    admin_margin_percentage: {
      type: String
    },
    admin_margin_price_adult: {
      type: Number
    },
    admin_margin_price_child: {
      type: Number
    },
    price_per_person_adult: {
      type: Number
    },
    price_per_person_child: {
      type: Number
    },
    extra_bad: {
      type: Number
    },
    admin_margin_extra_bad: {
      type: Number
    },
    travel_details: [
      {
        first_name: {
          type: String
        },
        last_name: {
          type: String
        },
        gender: {
          type: String
        },
        dob: {
          type: Date
        }
      }
    ]
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);
const highlights_schema = mongoose.model("hotel_booking_syt", hotel_booking);

module.exports = highlights_schema;
