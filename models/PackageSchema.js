const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const PackageSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    name: {
      type: String
      // required: true
    },
    // price_per_person: {
    //   type: Number,
    //   // required: true
    // },
    price_and_date: [
      {
        price_start_date: {
          type: Date
        },
        price_end_date: {
          type: Date
        },
        price_per_person: {
          type: Number
        },
        child_price: {
          type: Number
        },
        infant_price: {
          type: Number
        }
      }
    ],
    total_days: {
      type: Number
      // required: true
    },
    total_nights: {
      type: Number
      // required: true
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId
    },
    destination_category_id: [
      {
        type: mongoose.Schema.Types.ObjectId
        // required: true
      }
    ],
    meal_required: {
      type: Array
      // required: true // 0\1
    },
    meal_type: {
      type: String
      // required: true //0=nonveg , 1=veg,any
    },
    travel_by: {
      type: String
      // required: true
    },
    sightseeing: {
      type: String
      // required: true
    },
    hotel_type: {
      type: Array
      // required: true
    },
    more_details: {
      type: String
      // required: true
    },
    place_to_visit_id: {
      type: mongoose.Types.ObjectId
      // required: true
    },
    include_service: { type: Array },
    exclude_service: {
      type: Array
    },
    start_date: {
      type: Date
      // required: true
    },
    end_date: {
      type: Date
      // required: true
    },
    room_sharing: {
      type: String
    },
    package_type: {
      type: String
    },
    lunch_price: {
      type: Number
    },
    dinner_price: {
      type: Number
    },
    breakfast_price: {
      type: Number
    },
    lunch: {
      type: Boolean
    },
    dinner: {
      type: Boolean
    },
    breakfast: {
      type: Boolean
    },
    status: {
      type: Boolean,
      enum: ["true", "false"]
      // default: 0 // 1=active,0=block
    }
    // package_valid_till_for_booking: {
    //   type: Date
    // }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);
const packageSchema = new mongoose.model("Package", PackageSchema);
module.exports = packageSchema;
