const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const customerequirementSchema = new mongoose.Schema(
  {
    departure: {
      type: String,
      required: true
    },
    destination: {
      type: String,
      required: true
    },
    category: [
      {
        type: mongoose.Types.ObjectId,
        required: true
      }
    ],
    total_adult: {
      type: Number,
      default: 0
    },
    total_child: {
      type: Number,
      default: 0
    },
    Infant: {
      type: Number,
      required: true
    },
    personal_care: {
      type: String,
      required: true,
    },
    travel_by: {
      type: Array,
      required: true // 0 =by cab, 1=bus, 2=train, 3=airplan
    },
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true
    },
    tour_days: {
      type: Number
    },
    total_travel_days: {
      type: Number
    },
    sightseeing: {
      type: String // Add the sightseeing field as a string
    },
    hotel_type: {
      type: Array //5*,4*, 3*
    },
    meal_require: {
      type: Array
    },
    meal_type: {
      type: String,
      required: true // veg.,non-veg.,any
    },
    additional_requirement: {
      type: Array
    },
    user_id: {
      type: mongoose.Types.ObjectId
    },
    full_name: {
      type: String,
      required: true
    },
    email_address: {
      type: String,
      required: true
    },
    mobile_no: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    budget_per_person: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      default: "active"
    },
    Status_change_by: {
      type: mongoose.Types.ObjectId,
      require: true
    },
    isAddedToBidList: {
      type: Boolean,
      default: false
    },
    
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

const CustomRequirementSchema = new mongoose.model("custom_requirement", customerequirementSchema);
module.exports = CustomRequirementSchema;
