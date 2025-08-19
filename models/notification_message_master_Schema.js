const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const notification_message_master_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    mode: {
      type: String,
      required: true
    },
    message: {
      type: String,
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

notification_message_master_schema.plugin(aggregatePaginate);
notification_message_master_schema.plugin(mongoosePaginate);
const notification_message_master_Schema = new mongoose.model(
  "notification_message_master",
  notification_message_master_schema
);

module.exports = notification_message_master_Schema;
