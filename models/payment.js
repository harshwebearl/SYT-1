const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    merchant_transaction_id: {
        type: String,
        required: true,
    },
    transaction_id: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: false,
    },
    transaction_state: {
        type: String,
        required: true,
    },
    response_code: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    card_type: {
        type: String,
        required: false,
    },
    pg_transaction_id: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("payment", paymentSchema)