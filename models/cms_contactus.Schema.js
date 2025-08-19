const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const cms_contactus = new mongoose.Schema(
  {
    header: {
      type: String
    },
    banner_text: {
      type: String
    },
    latitude: {
      type: String
    },
    longitude: {
      type: String
    },
    banner_img: {
      type: String
    },
    contect_us_list: {
      type: [{ _id: false, title: String, address: String }],
      default: []
    },
    phone_list: {
      type: [{ _id: false, title: String, phone: Number }],
      default: []
    },
    email_list: {
      type: [{ _id: false, title: String, email: String }],
      default: []
    },
    mail_list: {
      type: [{ _id: false, title: String, mail: String }], //add _id:false to remove it from nested Obj
      default: []
    },
    status: {
      type: String,
      enum: ["active", "deactive", "deleted"],
      default: "active"
    },
    isNoFollow: {
      type: Boolean
      // required: true
    },
    isNoIndex: {
      type: Boolean
      // required: true
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      // unique: true,
      required: true
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

cms_contactus.plugin(aggregatePaginate);
cms_contactus.plugin(mongoosePaginate);
const cms_contactus_schema = new mongoose.model("cms_contactus", cms_contactus);

module.exports = cms_contactus_schema;

// const mongoose = require("mongoose");
// let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
// let mongoosePaginate = require("mongoose-paginate-v2");

// const contect_us_lists = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   address: {
//     type: String,
//     required: true
//   }
// });

// const phone_lists = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   phone: {
//     type: Number,
//     required: true
//   }
// });

// const email_lists = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true
//   }
// });

// const mail_lists = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   mail: {
//     type: String,
//     required: true
//   }
// });

// const cms_contactus = new mongoose.Schema(
//   {
//     header: {
//       type: String,
//       required: true
//     },
//     banner_text: {
//       type: String,
//       required: true
//     },
//     latitude: {
//       type: String,
//       required: true
//     },
//     longitude: {
//       type: String,
//       required: true
//     },
//     baner_img: {
//       type: String,
//       required: true
//     },
//     contect_us_list: {
//       type: [contect_us_lists],
//       required: true
//     },
//     phone_list: {
//       type: [phone_lists],
//       required: true
//     },
//     email_list: {
//       type: [email_lists],
//       required: true
//     },
//     mail_list: {
//       type: [mail_lists],
//       required: true
//     },
//     status: {
//       type: String,
//       required: true,
//       enum: ["active", "deactive", "deleted"],
//       default: "active"
//     },
//     agency_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true
//     },
//     is_deleted: {
//       type: Boolean,
//       default: false
//     }
//   },
//   {
//     timestamps: true
//   }
// );

// cms_contactus.plugin(aggregatePaginate);
// cms_contactus.plugin(mongoosePaginate);
// const cms_contactus_schema = new mongoose.model("cms_contactus", cms_contactus);

// module.exports = cms_contactus_schema;
