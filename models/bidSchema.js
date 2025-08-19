const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const BidSchema = new mongoose.Schema(
  {
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    custom_requirement_id: {
      // from user_requirement
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String
    },
    bid_date: {
      type: Date,
      required: true
    },
    total_days: {
      type: Number,
      required: true
    },
    total_nights: {
      type: Number,
      required: true
    },
    travel_by: {
      type: Array,
      required: true // 0=cab, 1 =bus, 2=train, 3= airplane
    },
    sightseeing: {
      type: String,
      required: true
    },
    hotel_types: {
      type: Array
      // required: true
    },
    meal_required: {
      type: Array //breakfast /lunch /dinner
      // required: true
    },
    meal_types: {
      type: Array //veg./nonveg./any
      // required: true
    },
    other_services_by_agency: {
      type: String
    },
    departure: {
      type: String,
      required: true
    },
    destination: {
      type: String,
      required: true
    },
    total_adult: {
      type: Number,
      required: true
    },
    package_type: {
      type: String
    },
    total_child: {
      type: Number,
      required: true
    },
    Infant: {
      type: Number,
      required: true
    },
    include_details: {
      type: Array,
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
    destination_category: {
      type: Array,
      required: true
    },
    include_services: {
      type: Array,
      required: true
    },
    exclude_services: {
      type: Array,
      required: true
    },
    total_amount: {
      type: Number,
      required: true
    },
    bid_status: {
      type: String, //1=active,0=deactive
      default: "save",
      enum: ["save", "submit", "reject", "expired", "booked another package"]
    },
    status_change_by: {
      type: mongoose.Schema.Types.ObjectId
    },
    additional_requirement: {
      type: String,
      required: true
    },
    personal_care: {
      type: String,
      required: true
    },
    price_per_person_child: {
      type: Number
    },
    price_per_person_adult: {
      type: Number
    },
    price_per_person_infant: {
      type: Number
    },
    room_sharing: {
      type: String
    },
    package_valid_till_for_booking: {
      type: Date
    },
    admin_margin: {
      type: String
    },
    admin_margin_price: {
      type: Number
    },
    lunch_price: {
      type: Number
    },
    dinner_price: {
      type: Number
    },
    breakfast_price: {
      type: Number
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

const Bidschema = new mongoose.model("bid", BidSchema);
module.exports = Bidschema;
