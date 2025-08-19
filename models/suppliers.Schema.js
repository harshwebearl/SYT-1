const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const Object1 = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    require: true
  },
  phone: {
    type: Number,
    require: true
  },
  fax: {
    type: String
  },
  website: {
    type: String
  },
  gst_num: {
    type: String
  },
  pan_num: {
    type: String
  }
});

const Object2 = new mongoose.Schema({
  account_info_bank_name: {
    type: String
  },
  account_info_account_num: {
    type: String
  },
  account_info_ifsc_code: {
    type: String
  },
  account_info_bank_address: {
    type: String
  }
});

const suppliers_schema = new mongoose.Schema(
  {
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: Number,
      required: true
    },
  
    address: {
      type: String,
      required: true
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    country: {
      type: String
    },
    access_services: {
      type: Array
    },
    company_info: {
      //   name: String,
      //  control_type:String
      type: Object1
      // default: null
    },
    account_info: {
      //   name: String,
      //  control_type:String
      type: [Object2],
      default: []
    },
    is_deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

suppliers_schema.plugin(aggregatePaginate);
suppliers_schema.plugin(mongoosePaginate);
const suppliers_Schema = new mongoose.model("suppliers", suppliers_schema);

module.exports = suppliers_Schema;
