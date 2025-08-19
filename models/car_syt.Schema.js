const mongoose = require("mongoose");

function getISTTime() {
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
    const now = new Date();
    const istTime = new Date(now.getTime() + istOffset);
    return istTime;
}

const CarSchema = new mongoose.Schema({
    car_name: {
        type: String,
        required: true
    },
    model_number: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
    fuel_type: {
        type: String,
        enum: ["petrol", "diesel", "electric"]
    },
    car_type: {
        type: String,
        required: true
    },
    car_seats: {
        type: Number,
        required: true
    }
},
    {
        timestamps: {
            currentTime: () => getISTTime() // Use custom function for timestamps
        }
    }
);

const carModel = mongoose.model("Car", CarSchema);
module.exports = carModel;
