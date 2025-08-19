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
  from_date: {
    type: Date
  },
  to_date: {
    type: Date
  },
  // base_price: {
  //   type: Number
  // },
  per_adult_extra_price: {
    type: Number
  },
  per_child_extra_price: {
    type: Number
  }
  // per_child_wb_extra_price: {
  //   type: Number
  // }
});

const room_schema = new mongoose.Schema(
  {
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    hotel_type: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    meal_plan: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    room_category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    thumb_img: {
      type: String
      // required: true
    },
    banner_img: {
      type: String
      // required: true
    },
    description: {
      type: String,
      required: true
    },
    pricing: {
      //   name: String,
      //  control_type:String
      type: [Object1],
      default: null
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

room_schema.plugin(aggregatePaginate);
room_schema.plugin(mongoosePaginate);
const room_Schema = new mongoose.model("pkg_hotel_room_inventory", room_schema);

module.exports = room_Schema;
