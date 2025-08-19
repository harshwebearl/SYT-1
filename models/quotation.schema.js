const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");
const CounterSchema = require("./counter.schema");
const Lead_Schema = require("./Lead_Schema");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const _quotationSchema = new mongoose.Schema(
  {
    lead_id: mongoose.Schema.Types.ObjectId, //ref leads
    code: String,
    stage: {
      type: String
      //draft,finalize
    },
    overview: {
      name: String,
      code: String,
      start_date: Date,
      end_date: Date,
      total_nights: Number,
      hotel_type: mongoose.Schema.Types.ObjectId, //ref pkg_hotel_types (global)
      adult_pax: Number,
      child_pax: Number,
      total_pax: Number,
      meta_description: String,
      thumb_img: String
    },
    itineraries: [
      {
        city: mongoose.Schema.Types.ObjectId, // ref locations
        heading: String,
        description: String,
        activities: [
          {
            destination: mongoose.Schema.Types.ObjectId, //ref cms_destinations
            activity: mongoose.Schema.Types.ObjectId, //ref cms_activities
            activity_img: String,
            activity_name: String,
            activity_priceperperson: Number,
            activity_description: String
          }
        ]
      }
    ],
    tour_gallery: [{ seq_no: Number, img_name: String, img: String }],
    package_policy: {
      inclusion: String,
      exclusion: String,
      b_c_p_terms: String,
      notes: String,
      extra_activity: String
    },
    transportation: [
      {
        transfer_type: mongoose.Schema.Types.ObjectId, // ref transfer_types
        vehicle_type: String,
        vehicle_name: String,
        source: String,
        destination: String,
        remark: String,
        price: Number,
        units: Number,
        net_amount: Number
      }
    ],
    hotels: [
      {
        guest_name: String,
        payable_by: String,
        country: String,
        state: String,
        city: String,
        hotel_type: mongoose.Schema.Types.ObjectId, // ref pkg_hotel_types
        hotel: mongoose.Schema.Types.ObjectId, // ref pkg_hotels
        room_category: mongoose.Schema.Types.ObjectId, // ref room_categories
        room_occupancy: mongoose.Schema.Types.ObjectId, // ref room_occupancies
        checkin_date: Date,
        checkout_date: Date,
        total_nights: Number,
        meal_type: mongoose.Schema.Types.ObjectId, // ref meal_types
        total_rooms: Number,
        price: Number,
        extra_adult: Number,
        extra_adult_rate: Number,
        extra_child: Number,
        extra_child_rate: Number,
        remark: String,
        gallery: [
          {
            img: String,
            img_name: String
          }
        ],
        net_amount: Number
      }
    ],
    flights: [
      {
        airline: String,
        flight_no: String,
        from: String,
        to: String,
        class: String,
        departure_date: Date,
        departure_time: String,
        arrival_date: Date,
        arrival_time: String,
        price: Number,
        airline_logo: String,
        net_amount: Number
      }
    ],
    quotation: mongoose.Schema.Types.Mixed,
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

_quotationSchema.plugin(aggregatePaginate);
_quotationSchema.plugin(mongoosePaginate);
_quotationSchema.pre("save", async function () {
  let doc = this;
  const counter = await CounterSchema.findOneAndUpdate(
    {
      _id: {
        db: "syt_final",
        coll: "quotations"
      }
    },
    { $inc: { seq_value: 1 } },
    { returnNewDocument: true, upsert: true }
  );
  // console.log("count:", JSON.stringify(counter))
  doc.code = `QKG${counter?.seq_value}`;

  console.log(doc);
  const updateLeadStage = await Lead_Schema.findOne(doc?.lead_id);
  if (updateLeadStage.stage === "fresh") {
    const lead = await Lead_Schema.findByIdAndUpdate(updateLeadStage?._id, { stage: "opportunity" });
    console.log(222, lead);
  }
  console.log(updateLeadStage);
}); // pre save hook ends here

const quotationSchema = new mongoose.model("quotation", _quotationSchema);

module.exports = quotationSchema;
