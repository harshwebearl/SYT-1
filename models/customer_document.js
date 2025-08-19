const mongoose = require('mongoose')

function getISTTime() {
    const istOffset = 5.5 * 60 *60 * 1000; // IST is UTC +5:30
    const now = new Date();
    const istTime = new Date(now.getTime() + istOffset);
    return istTime;
  }

const documentSchema = new mongoose.Schema({
    customer_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'customer',
        required:true
    },
    document_type:{
        type:String,
        required:true
    },
    document_frontphoto:{
        type:String,
        required:true
    },
    document_backphoto:{
        type:String,
        required:true
    },
    document_issue_date:{
        type:Date,
        required:true
    },
    document_expiry_date:{
        type:Date,
        required:true
    }
},{
    timestamps: {
      currentTime: () => getISTTime() 
    }
})

const Document = mongoose.model('customer_document',documentSchema)
module.exports=Document;