const mongoose = require("mongoose");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const contact_detail = new mongoose.Schema({
  company_name: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  ISD_code: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  budget: {
    type: Number,
    required: true
  }
});

const requirement = new mongoose.Schema({
  requirement: {
    type: String,
    required: true
  }
});

const lead_source = new mongoose.Schema({
  source: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

const number_of_passenger = new mongoose.Schema({
  adult: {
    type: Number,
    required: true
  },
  no_of_children: {
    type: Number,
    required: true
  }
});

const service = new mongoose.Schema({
  type_of_service: {
    type: String,
    required: true
  }
});

const travel_info = new mongoose.Schema({
  travel_date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  cities: {
    type: String,
    required: true
  },
  deadline_date: {
    type: Date,
    required: true
  },
  city_name: {
    type: String,
    required: true
  },
  customer_type: {
    type: String,
    enum: ["b2b", "b2c"],
    required: true
  }
});

const lead_booking = new mongoose.Schema(
  {
    contact_details: {
      type: contact_detail,
      required: true
    },
    requirements: {
      type: requirement,
      required: true
    },
    lead_sources: {
      type: lead_source,
      required: true
    },
    number_of_passengers: {
      type: number_of_passenger,
      required: true
    },
    services: {
      type: service,
      required: true
    },
    travel_infos: {
      type: travel_info,
      required: true
    },
    agency_id: {
      type: mongoose.Schema.Types.ObjectId,
      require: true
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

const lead_booking_schema = new mongoose.model("lead_booking", lead_booking);
module.exports = lead_booking_schema;
