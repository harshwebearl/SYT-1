const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const object1 = new mongoose.Schema({
  company_name: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    required: true
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  contact_no: {
    type: Number,
    required: true
  },
  whatsapp_no: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  }
});

const object3 = new mongoose.Schema({
  facebook_url: {
    type: String,
    required: true
  },
  twitter_url: {
    type: String,
    required: true
  },
  instagram_url: {
    type: String,
    required: true
  },
  linkedin_url: {
    type: String,
    required: true
  },
  google_url: {
    type: String,
    required: true
  }
});

const object4 = new mongoose.Schema({
  gst_on_markup: {
    type: Boolean
    // required:true
  }
});

const object2 = new mongoose.Schema({
  partner_image: {
    type: Array,
    require: true
  }
});

const object5 = new mongoose.Schema({
  related_link: {
    type: String,
    required: true
  }
});

const object6 = new mongoose.Schema({
  tawk_script: {
    type: String,
    required: true
  }
});

const object7 = new mongoose.Schema({
  content: {
    type: String
  },
  want_to_display_logo: {
    type: Boolean
  },
  want_to_enable_auto_refund: {
    type: Boolean
  },
  want_to_enable_chat_in_quotation: {
    type: Boolean
  },
  want_otp_authentication: {
    type: Boolean
  },
  pdf_colour_code: {
    type: String,
    require: true
  }
  // booking_setting:{
  //     online:{
  //         type:Boolean
  //     },
  //     offline:{
  //         type:Boolean
  //     }
  // }
});

const object8 = new mongoose.Schema({
  sr_no: {
    type: Number,
    require: true
  },
  bank_name: {
    type: String,
    required: true
  },
  account_no: {
    type: Number,
    require: true
  },
  ifsc_code: {
    type: Number,
    require: true
  },
  address: {
    type: String,
    require: true
  }
});

const profile_setting = new mongoose.Schema(
  {
    company_detail: {
      type: object1,
      required: true,
      default: null
    },
    associated_partner: {
      type: object2,
      required: true,
      default: null
    },
    social_media_link: {
      type: object3,
      required: true,
      default: null
    },
    mark_up_gst: {
      type: object4,
      required: true,
      default: null
    },
    related_link: {
      type: object5,
      required: true,
      default: null
    },
    tawk_script: {
      type: object6,
      required: true,
      default: null
    },
    footer_content: {
      type: object7,
      required: true,
      default: null
    },
    account_information: {
      type: object8,
      required: true,
      default: null
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true
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

profile_setting.plugin(aggregatePaginate);
profile_setting.plugin(mongoosePaginate);
const Profile_setting = new mongoose.model("profile_setting", profile_setting);

module.exports = Profile_setting;
