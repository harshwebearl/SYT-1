const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const auto_car = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    location_from: {
      type: String,
      required: true
    },
    location_to: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    img: {
      type: String
    },
    distance: {
      type: Number
    },
    car_type: {
      type: String,
      required: true
    },
    trip_type: {
      type: String,
      enum: ["oneway", "roundtrip"]
    },
    base_distance: {
      type: Number
      // required: isTripTypeRoundTrip
    },
    base_price: {
      // for 1 day
      type: Number
      // required: isTripTypeRoundTrip
    },
    price: {
      // or price after base distance
      type: Number
    },
    bata: {
      type: String
    },
    toll: {
      type: Number
      // required: !isTripTypeRoundTrip
      // set: function () { return this.trip_type === "roundtrip" ? 0 : this.toll }
    },
    permit: {
      type: Number
    },
    total_price: {
      type: Number,
      default: 0
      // required: true
      // set: calculateTotalPrice
    },
    inclusions: {
      type: [String]
    },
    exclusions: {
      type: [String]
    },
    facilities: {
      type: String
    },
    status: {
      type: String,
      enum: ["active", "deactive", "deleted"],
      default: "active",
      required: true
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
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

function isTripTypeRoundTrip() {
  if (this.trip_type === "roundtrip") {
    return true;
  }
  return false;
}
function calculateTotalPrice(_this) {
  if (_this.trip_type === "oneway") {
    _this.base_distance = undefined;
    _this.base_price = undefined;
    return (
      (+_this.price || 0) * (+_this.distance || 0) + (+_this.bata || 0) + (+_this.toll || 0) + (+_this.permit || 0)
    );
  } else if (_this.trip_type === "roundtrip") {
    _this.toll = undefined; //will pass $unset to mongodb
    return (
      ((+_this.distance || 0) - (+_this.base_distance || 0)) * (+_this.price || 0) +
      (+_this.base_price || 0) +
      (+_this.bata || 0) +
      (+_this.permit || 0)
    );
  } else {
    return 0;
  }
}
auto_car.plugin(aggregatePaginate);
auto_car.plugin(mongoosePaginate);
// auto_car.pre('save', async function (next) { // this line
//   calculateTotalPrice()
//   this.total_price = 200;
//   console.log(22, this.total_price)
//   next();
// });
auto_car.pre("save", function (next) {
  // this line
  this.total_price = calculateTotalPrice(this);
  // console.log(22, this.total_price, )
  next();
  // in es6 ARROW FUCNTION this refers to current file/func
  // in es5 function this refers to caller
});
const auto_car_Schema = new mongoose.model("auto_car", auto_car);

module.exports = auto_car_Schema;
