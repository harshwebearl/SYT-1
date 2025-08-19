const mongoose = require('mongoose');

function getISTTime() {
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
    const now = new Date();
    const istTime = new Date(now.getTime() + istOffset);
    return istTime;
}

const customerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    country: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    customerPhoto: {
        type: String,
        required: true
    },
    agency_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'agency',
        required: true
    }

}, {
    timestamps: {
        currentTime: () => getISTTime()
    }
})

const Customer = mongoose.model('Customer_details', customerSchema);
module.exports = Customer;