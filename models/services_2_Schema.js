const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const schema1 = new mongoose.Schema({
  field_name: {
    type: String,
    required: true
  },
  control_type: {
    type: String,
    require: true
  }
});

const services_2_schema = new mongoose.Schema(
  {
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: "active"
      // required: true
    },
    additional_fields: {
      //   name: String,
      //  control_type:String
      type: [schema1]
      // required: true // for array to have atleast one element
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

const services_2_Schema = new mongoose.model("services_2", services_2_schema);

module.exports = services_2_Schema;
