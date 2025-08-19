const mongoose = require('mongoose');

const membership_feature = new mongoose.Schema({
    membership_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    membership_feature_status: {
        type: Boolean
    },
})

const membership_plan = new mongoose.Schema({
    plan_name: {
        type: String,
        required: true
    },
    plan_days: {
        type: Number,
        require: true
    },
    plan_original_price: {
        type: Number,
        require: true
    },
    plan_selling_price: {
        type: Number,
        require: true
    },
    contact_limit: {
        type: Number,
        require: true
    },
    membership_feature_id: {
        type: [membership_feature],
        required: true
    },
    status: {
        type: String,
        default: 'active'
    },
    sequence: {
        type: Number,
        required: true
    }
})

const membership_plan_schema = new mongoose.model('membership_plan', membership_plan);

module.exports = membership_plan_schema;