const mongoose = require('mongoose');

const membership_feature = new mongoose.Schema({
    feature_name:{
        type: String,
        required: true
    } 
})

const membership_feature_schema = new mongoose.model('membership_feature',membership_feature);

module.exports = membership_feature_schema;