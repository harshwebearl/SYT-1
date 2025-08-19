const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const cms_activities = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId
      // required: true
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    header: {
      type: String
    },
    price_for_adult: {
      type: String
    },
    price_for_child: {
      type: String
    },
    price_for_infant: {
      type: String
    },
    discount: {
      type: String
    },
    available_from: {
      type: String,
      required: true
    },
    available_to: {
      type: String,
      required: true
    },
    available: {
      type: String
    },
    seo_url: {
      type: String,
      required: true
    },
    meta_keyword: {
      type: String
    },
    seo_title: {
      type: String
    },
    meta_description: {
      type: String
    },
    og_tag: {
      type: String
    },
    video_url: {
      type: String
    },
    image: {
      type: String
    },
    tax: {
      type: Number
    },
    duration: {
      type: Number
    },
    location: {
      type: String
    },
    closing_days: [String],
    description: {
      type: String
    },
    activity_policies: {
      type: String
    },
    terms_n_conditions: {
      type: String
    },
    cancellation_policy: {
      type: String
    },
    is_no_cancellation: {
      type: Boolean
    },
    is_show_mobile_or_printvoucher: {
      type: Boolean
    },
    is_fixed_date_ticket: {
      type: Boolean
    },
    is_english_language: {
      type: Boolean
    },
    is_minimum_one_travelers_to_book: {
      type: Boolean
    },
    is_meetup_with_guide: {
      type: Boolean
    },
    is_sightseeing: {
      type: Boolean
    },
    is_featured: {
      type: Boolean
    },
    is_activity_only: {
      type: Boolean
    },
    is_transfer_included: {
      type: Boolean
    },
    is_transfer_with_price: {
      type: Boolean
    },
    activity_type: {
      type: String
      // required: true
    },
    images: [
      {
        heading: String,
        img: String
      }
    ],
    private_basis_0to4_seater_price: {
      type: Number
      // required: true
    },
    private_basis_5to7_seater_price: {
      type: Number
      // required: true
    },
    private_basis_8to13_seater_price: {
      type: Number
      // required: true
    },
    sic_basis_sic_price: {
      type: Number
      // required: true
    },
    detail_list: [
      {
        from_date: {
          type: Date
          // required: true
        },
        to_date: {
          type: Date
          // required: true
        },
        per_adult_price: {
          type: Number
          // required: true
        },
        per_child_price: {
          type: Number
          // required: true
        }
      }
    ],
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
    timestamps: {
      currentTime: () => getISTTime() // Use custom function for timestamps
    }
  }
);

cms_activities.plugin(aggregatePaginate);
cms_activities.plugin(mongoosePaginate);
const cms_activities_schema = new mongoose.model("cms_activities", cms_activities);

module.exports = cms_activities_schema;
