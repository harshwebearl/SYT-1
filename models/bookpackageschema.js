const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const notificationObj = new mongoose.Schema(
  {
    deviceType: {
      type: String,
      enum: ["ios", "android", "web"],
      // default: "ios",
      required: false
    },
    deviceToken: {
      type: String,
      required: false
    },
    lastUpdatedOn: {
      type: Date,
      required: false
    }
  },
  {
    _id: false
  }
);

const bookpackageschema = new mongoose.Schema(
  {
    user_registration_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    bookdate: {
      type: Date
    },
    payment_type: {
      type: String
      // required: false
    },
    title: {
      type: String
    },
    package_type: {
      type: String
    },
    payment_type_on_booking: {
      type: String
    },
    bid_package_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    package_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    custom_requirement_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId
    },
     gst_price: {
      type: Number,
      default: 0
    },
    hotel_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    // transaction_id: {
    //   type: "String",
    //   required: false
    // },
    total_adult: {
      type: Number,
      required: false
    },
    total_child: {
      type: Number,
      required: false
    },
    total_infant: {
      type: Number,
      required: false
    },
    contact_number: {
      type: Number,
      required: false
    },
    email_id: {
      type: String,
      required: false
    },
    approx_start_date: {
      type: String
      // required: false
    },
    totaldays: {
      type: Number,
      required: false
    },
    totalnight: {
      type: Number,
      required: false
    },
    meal: {
      type: Array,
      required: false
    },
    meal_type: {
      type: Array,
      required: false
    },
    siteseeing: {
      type: String,
      required: false
    },
    transport_mode: {
      type: String,
      required: false
    },
    hoteltype: {
      type: String
      // required: false
    },
    priceperperson: {
      type: Number
      // required: false
    },
    total_person: {
      type: Number,
      required: false
    },
    agency_contect_no: {
      type: Number
      // required: false
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false
      }
    ],
    booked_include: {
      type: Array,
      required: false
    },
    booked_exclude: {
      type: Array,
      required: false
    },
    personal_care: {
      type: String,
      required: false
    },
    othere_requirement: {
      type: String,
      required: false
    },
    departure: {
      type: String,
      required: false
    },
    destination: {
      type: String
    },
    approx_end_date: {
      type: String
      // required: false
    },
    user_name: {
      type: String,
      required: false
    },
    status: {
      type: String,
      required: false
      // default: "booked"
    },
    status_chenged_by: {
      type: String,
      default: ""
    },
    state: {
      type: String,
      required: false
    },
    city: {
      type: String,
      required: false
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
    total_price: {
      type: Number
    },
    room_sharing: {
      type: String
    },
    total_amount: {
      type: Number
    },
    notificationTokens: {
      type: notificationObj,
      default: null
    },
    booked_itinerary: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false
      }
    ],
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
    ],
    gst_address: {
      type: String
    },
    other_services_by_agency: {
      type: String
    },
    destination_arrival_date: {
      type: Date
    },
    payment: [
      {
        paid_amount: {
          type: Number
        },
        payment_date: {
          type: Date
        },
        payment_mode: {
          type: String
        },
        transaction_id: {
          type: String
        },
        payment_status: {
          type: String
        }
      }
    ],
    admin_margin_percentage: {
      type: String
    },
    admin_margin_price_adult: {
      type: Number
    },
    admin_margin_price_child: {
      type: Number
    },
    admin_margin_price_infant: {
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
    },
    hotel_itinerary_array: [
      {
        breakfast_price: {
          type: Number
        },
        lunch_price: {
          type: Number
        },
        dinner_price: {
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
        room_id: {
          type: mongoose.Schema.Types.ObjectId
        },
        hotel_itinerary_id: {
          type: mongoose.Schema.Types.ObjectId
        }
      }
    ],
    extra_food_array: [
      {
        selected_intinarary_hotel: {
          type: String
        },
        meals: [
          {
            type: {
              type: String, // e.g., 'breakfast', 'lunch', 'dinner'
              required: false
            },
            selected: {
              type: Boolean,
              default: false
            },
            price: {
              type: Number,
              required: function () {
                return this.selected === true;
              }
            }
          }
        ],
        days: {
          type: Number
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

const bookpackage = new mongoose.model("book_package", bookpackageschema);
module.exports = bookpackage;
