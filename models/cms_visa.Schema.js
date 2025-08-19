const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const description = new mongoose.Schema({
  visa_type: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: {
    type: String
  }
});

const visa_pricing_lists = new mongoose.Schema({
  visa_type: {
    type: mongoose.Schema.Types.ObjectId
  },
  entry_type: {
    type: mongoose.Schema.Types.ObjectId
  },
  validity: {
    type: String
  },
  processing: {
    type: String
  },
  embassy_fee: {
    type: Number
  },
  service_fee: {
    type: Number
  },
  gstin: {
    type: Number
  },
  totalcost: {
    type: Number
  }
});

const rule = new mongoose.Schema({
  heading: {
    type: String
  },
  description: {
    type: String
  }
});

const document = new mongoose.Schema({
  heading: {
    type: String
  },
  img: {
    type: String
  },
  description: {
    type: String
  }
});

const cms_visa_schema = new mongoose.Schema(
  {
    visa_from: {
      type: String,
      required: true
    },
    visa_to: {
      type: String,
      required: true
    },
    seo_url: {
      type: String,
      required: true
    },
    img: {
      type: String
    },
    address: String,
    email: String,
    phone: String,
    fax: String,
    is_featured: {
      type: Boolean,
      default: false
    },
    important_notes: {
      type: String
    },
    descriptions: {
      type: [description]
    },
    visa_pricing_list: {
      type: [visa_pricing_lists]
    },
    rules: {
      type: [rule]
    },
    documents: {
      type: [document]
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "deactive", "deleted"],
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
    timestamps: true
  }
);

cms_visa_schema.plugin(aggregatePaginate);
cms_visa_schema.plugin(mongoosePaginate);
const cms_visa_Schema = new mongoose.model("cms_visa", cms_visa_schema);

module.exports = cms_visa_Schema;
