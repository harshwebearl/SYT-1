const mongoose = require('mongoose');

function getISTTime() {
    const istOffset = 5.5 * 60 *60 * 1000; // IST is UTC +5:30
    const now = new Date();
    const istTime = new Date(now.getTime() + istOffset);
    return istTime;
  }

const detailDisccusionSchema = new mongoose.Schema({
    discussion:{
        type:String,
        required:true
    },
    discussion_date:{
        type:Date,
        required:true
    }
})

const leadSchema = new mongoose.Schema({
    mobile:{
        type:Number,
        required:true
    },
    whatsappNum:{
        type:Number,
        required:true
    },
    Name:{
        type:String,
        required:true
    },
    service:{
        type:String,
        required:true
    },
    Source:{
        type:String,
        required:true
    },
    StaffName:{
        type:String,
        required:true
    },
    nextFollowUp:{
        type:Date,
        required:true
    },
    detail_discussion:{
        type:[detailDisccusionSchema],
        required:true
    },
    status:{
        type:String,
        enum:['hot','cold','convert','reject','other'],
        required:true
    },
    agency_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'agency'
    }
},{
    timestamps: {
      currentTime: () => getISTTime() 
    }
})

const Lead = mongoose.model('Lead',leadSchema);

module.exports = Lead;