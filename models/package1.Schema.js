const CounterSchema = require("./counter.schema");
const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const route_map_lists = new mongoose.Schema({
  city_name: {
    type: String,
    required: true
  },
  no_of_days: {
    type: Number,
    required: true
  }
});

const includes = new mongoose.Schema({
  flights: {
    type: String,
    required: true
  },
  hotel_stay: {
    type: String,
    required: true
  },
  meals: {
    type: String,
    required: true
  },
  transfers: {
    type: String,
    required: true
  },
  sightseeing: {
    type: String,
    required: true
  },
  cruise: {
    type: String,
    required: true
  }
});

const specializations = new mongoose.Schema({
  currency: {
    type: String,
    required: true
  },
  price_type: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    required: true
  },
  tax: {
    type: String,
    required: true
  },
  includes: {
    type: String,
    required: true
  }
});

const package_policys = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  inclusion: {
    type: String,
    required: true
  },
  exclusion: {
    type: String,
    required: true
  },
  booking_cancellation_and_payment_terms: {
    type: String,
    required: true
  },
  important_notes_visa_docs: {
    type: String,
    required: true
  },
  extra_activity: {
    type: String,
    required: true
  }
});

const package1_schema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true
    },
    overview: {
      title: String,
      name: String,
      // code/Id
      category: mongoose.Schema.Types.ObjectId, //ref pkg_category
      valid_from: Date,
      valid_to: Date,
      url: String,
      meta_keyword: String,
      og_tag: String,
      meta_description: String,
      thumb_img: String,
      total_travel_days: Number,
      route_map: [{ locationId: mongoose.Schema.Types.ObjectId, days: Number }], //(validate length in UI with total_travel_days)
      includes_flights: Boolean,
      includes_hotelstay: Boolean,
      includes_meal: Boolean,
      includes_transfers: Boolean,
      includes_sightseeing: Boolean,
      includes_cruise: Boolean
    },
    hotels: {},
    specializations: {
      currency: mongoose.Schema.Types.ObjectId, //ref currencies
      price_type: String,
      price: Number,
      pub_price: Number,
      is_pub_price: Boolean,
      discount: Number,
      pub_discount: Number,
      is_pub_discount: Boolean,
      tax: Number,
      pub_tax: Number,
      is_pub_tax: Boolean,
      specializations: [mongoose.Schema.Types.Mixed]
    },
    itineraries: [
      {
        city: mongoose.Schema.Types.ObjectId, // ref location city
        heading: String,
        description: String
      }
    ],
    tour_gallery: [{ img_name: String, img: String }],
    transportation: [
      {
        transfer_type: mongoose.Schema.Types.ObjectId, // ref tranferTypeTable
        vehicle_type: String,
        vehicle_name: String,
        source: String,
        destination: String,
        price: Number,
        remark: String,
        units: Number
      }
    ],
    package_policy: {
      description: String,
      pub_description: String,
      is_pub_description: Boolean,
      inclusion: String,
      pub_inclusion: String,
      is_pub_inclusion: Boolean,
      exclusion: String,
      pub_exclusion: String,
      is_pub_exclusion: Boolean,
      b_c_p_terms: String,
      pub_b_c_p_terms: String,
      is_pub_b_c_p_terms: Boolean,
      notes: String,
      pub_notes: String,
      is_pub_notes: Boolean,
      extra_activity: String,
      pub_extra_activity: String,
      is_pub_extra_activity: Boolean
    },
    pricing: [
      {
        valid_from: Date,
        valid_to: Date,
        items: [
          {
            hotel: mongoose.Schema.Types.ObjectId, // ref pkg_hotel
            price_2pax: Number,
            price_4pax: Number,
            price_6pax: Number,
            price_8pax: Number,
            price_extra_adult: Number,
            price_extra_child: Number,
            price_extra_infant: Number
          }
        ]
      }
    ],
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

package1_schema.plugin(aggregatePaginate);
package1_schema.plugin(mongoosePaginate);
package1_schema.pre("save", async function () {
  let doc = this;
  const counter = await CounterSchema.findOneAndUpdate(
    {
      _id: {
        db: "syt_final",
        coll: "package1"
      }
    },
    { $inc: { seq_value: 1 } },
    { returnNewDocument: true, upsert: true }
  );
  doc.code = `PKG${counter?.seq_value}`;
}); // pre save hook ends here

const package1_Schema = new mongoose.model("package1", package1_schema);

module.exports = package1_Schema;
