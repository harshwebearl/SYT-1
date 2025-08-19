// const mongoose = require("mongoose");
// let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
// let mongoosePaginate = require("mongoose-paginate-v2");

// function getISTTime() {
//   const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
//   const now = new Date();
//   const istTime = new Date(now.getTime() + istOffset);
//   return istTime;
// }

// const lead_schema = new mongoose.Schema(
//   {
//     company_name: {
//       type: String
//     },
//     name: {
//       type: String,
//       required: true
//     },
//     phone: {
//       type: Number,
//       required: true
//     },
//     email: {
//       type: String,
//       required: true
//     },
//     budget: {
//       type: Number
//     },
//     requirement: {
//       type: String
//     },
//     ISD_code: {
//       type: String
//     },
//     service: {
//       type: String,
//       // type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       enum: ["package", "other"]
//     },
//     supplier_serviceId: {
//       type: mongoose.Schema.Types.ObjectId
//     },
//     supplier_service_dynamic_fields: {
//       type: mongoose.Schema.Types.Mixed
//     },
//     source: {
//       type: String
//       // enum: ["reference", "google", "whatsapp"],
//     },
//     branch: {
//       type: String
//     },
//     childern: {
//       type: Number
//     },
//     adult: {
//       type: Number
//     },
//     travel_date: {
//       type: Date
//     },
//     day: {
//       type: Number
//     },
//     cities: {
//       type: Array
//     },
//     deadline_date: {
//       type: Date
//     },
//     city_name: {
//       type: String
//     },
//     customer_type: {
//       type: String,
//       enum: ["B2B", "B2C"]
//     },
//     allocated_to: {
//       type: mongoose.Schema.Types.ObjectId
//     },
//     status: {
//       // leadstatus
//       type: String,
//       default: "fresh",
//       enum: ["fresh", "opportunity", "booking", "completed", "cancelled"]
//     },
//     stage: {
//       // leadstatus
//       type: String,
//       default: "fresh",
//       // fresh - new
//       // opportunity - maybe
//       // booking - pkg finalized and under booking process
//       // completed - if all payments and tour done
//       // closed - if payments not done or uninterested or refund
//       enum: ["fresh", "opportunity", "bookings", "completed", "cancelled"]
//       // DONT USE "booking" or "closed" as enum
//     },
//     // SEPERATE TIMELINE TABLE for frequent updates thats why
//     // IF stage===closed IS CANCELLED
//     cancellation_reason: "",
//     cancellation_remark: "",
//     // DEFAULT FIELDS
//     agency_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       require: true
//     },
//     is_deleted: {
//       type: Boolean,
//       default: false
//     }
//   },
//   {
//     timestamps: {
//       currentTime: () => getISTTime() // Use custom function for timestamps
//     }
//   }
// );

// lead_schema.plugin(aggregatePaginate);
// // lead_schema.plugin(mongoosePaginate);
// const Lead_Schema = new mongoose.model("lead", lead_schema);

// // TO GIVE DEFAULT OPTIONS GLOBALLY
// // also to avoid repeatative code for all schemas
// Lead_Schema.aggregatePaginate.options = {
//   // page: 1,
//   // limit: 10,
//   customLabels: {
//     // totalDocs: 'itemCount',
//     // docs: 'itemsList',
//     // limit: 'perPage',
//     // page: 'currentPage',
//     // nextPage: 'next',
//     // prevPage: 'prev',
//     // totalPages: 'pageCount',
//     // pagingCounter: 'slNo',
//     // meta: 'paginator',
//     meta: "pageInfo"
//   }
// };

// module.exports = Lead_Schema;
