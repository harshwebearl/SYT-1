const mongoose = require("mongoose");

function getISTTime() {
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
    const now = new Date();
    const istTime = new Date(now.getTime() + istOffset);
    return istTime;
}


const car_booking_syt = new mongoose.Schema({
    vendor_car_id: {
        type: mongoose.Types.ObjectId,
    },
    transaction_id: {
        type: String,
    },
    user_id: {
        type: mongoose.Types.ObjectId,
    },
    pickup_address: {
        type: String,
        required: true
    },
    pickup_state : {
        type: String,
        required: true
    },
    pickup_city : {
        type: String,
        required: true
    },
    drop_address: {
        type: String,
        required: true
    },
    drop_state : {
        type: String,
        required: true
    },
    drop_city : {
        type: String,
        required: true
    },
    total_days: {
        type: Number,
    },
    amount: {
        type: Number,
    },
    one_way_two_way: {
        type: Boolean,
        required: true
    },
    pickup_date: {
        type: Date,
        required: true
    },
    pickup_time: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile_number: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    return_date: {
        type: Date,
        required: false
    },
    return_time: {
        type: String,
        required: false
    },
    status: {
        type: String,
        default: 'pending'
    },
    car_condition: {
        type: String,
    },
    model_year: {
        type: Number,
    },
    insurance: {
        type: Boolean,
    },
    registration_number: {
        type: String,
    },
    color: {
        type: String,
    },
    price_type: {
        type: String,
        enum: ['km', 'day']
    },
    price_per_km: {
        type: Number,
    },
    price_per_day: {
        type: Number,
    },
    pincode: {
        type: Number,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    outStateAllowed: {
        type: Boolean,
    },
    AC: {
        type: Boolean,
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

},
    {
        timestamps: {
            currentTime: () => getISTTime() // Use custom function for timestamps
        }
    }
);


module.exports = mongoose.model('car_booking_syt', car_booking_syt)
