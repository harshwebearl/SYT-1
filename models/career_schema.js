const mongoose = require('mongoose')

const career = mongoose.Schema({
    career_title: {
        type: String
    },
    career_desc: {
        type: String
    },
    career_tag: {
        type: [String]
    },
    career_category_id: {
        type: mongoose.Schema.Types.ObjectId
    }
})

const career_schema = new mongoose.model('career', career);

module.exports = career_schema;