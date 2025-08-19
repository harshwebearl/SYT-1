const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const cms_testimonials_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    designation: {
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
    testimonial: {
      type: String,
      required: true
    },
    img: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["active", "deleted", "deactive"],
      default: "active"
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
cms_testimonials_schema.plugin(aggregatePaginate);
cms_testimonials_schema.plugin(mongoosePaginate);
const cms_testimonials_Schema = new mongoose.model("cms_testimonial", cms_testimonials_schema);

module.exports = cms_testimonials_Schema;
