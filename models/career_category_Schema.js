const mongoose = require('mongoose')

const career_category = mongoose.Schema({ 
    career_cat_value :{
        type:String
    }
})

const career_category_schema = new mongoose.model('career_category',career_category);

module.exports = career_category_schema;