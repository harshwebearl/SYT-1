const mongoose = require('mongoose');

function getISTTime() {
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
    const now = new Date();
    const istTime = new Date(now.getTime() + istOffset);
    return istTime;
}

const otpSchema = new mongoose.Schema({
    contact: {
        type: Number,
        required: true
    },
    otp: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: getISTTime(),
        expires: 300 // Set document to expire after 10 minutes (600 seconds)
    }
});

const Otp = mongoose.model('otp_schema', otpSchema);

module.exports = Otp;
