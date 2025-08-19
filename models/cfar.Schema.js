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
  heading: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  sub_title: {
    type: String,
    required: true
  },
  alt_tag: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: true
  }
});

const Cfar_Schema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true
    },
    from_date: {
      type: Date,
      required: true
    },
    to_date: {
      type: Date,
      required: true
    },
    sections: {
      type: Object1,
      required: true,
      default: null
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

Cfar_Schema.plugin(aggregatePaginate);
Cfar_Schema.plugin(mongoosePaginate);
const Cfar_schema = new mongoose.model("cfar", Cfar_Schema);

module.exports = Cfar_schema;
