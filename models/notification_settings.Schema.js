const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const s_m_s = new mongoose.Schema({
  birthday: {
    type: Boolean,
    default: false
  },
  anniversary: {
    type: Boolean,
    default: false
  },
  followup_reminder: {
    type: Boolean,
    default: false
  },
  lead_allocation: {
    type: Boolean,
    default: false
  },
  quotation_sharing: {
    type: Boolean,
    default: false
  },
  quotation_replay: {
    type: Boolean,
    default: false
  },
  auto_invoice: {
    type: Boolean,
    default: false
  },
  manual_invoice: {
    type: Boolean,
    default: false
  },
  customer_payment_reminder: {
    type: Boolean,
    default: false
  },
  supplier_payment_receipt: {
    type: Boolean,
    default: false
  },
  hotel_voucher: {
    type: Boolean,
    default: false
  },
  transfer_voucher: {
    type: Boolean,
    default: false
  },
  booking_confirmation_letter: {
    type: Boolean,
    default: false
  },
  other_service_Quotation: {
    type: Boolean,
    default: false
  },
  web_leads: {
    type: Boolean,
    default: false
  },
  trip_reminder: {
    type: Boolean,
    default: false
  },
  notify_customer: {
    type: Boolean,
    default: false
  },
  b2b_quotation_sharing: {
    type: Boolean,
    default: false
  },
  otp: {
    type: Boolean,
    default: false
  },
  account_registration: {
    type: Boolean,
    default: false
  },
  flight_booking: {
    type: Boolean,
    default: false
  },
  flight_cancellation: {
    type: Boolean,
    default: false
  },
  package_booking: {
    type: Boolean,
    default: false
  },
  package_cancellation: {
    type: Boolean,
    default: false
  },
  hotel_booking: {
    type: Boolean,
    default: false
  },
  hotel_cancellation: {
    type: Boolean,
    default: false
  },
  activity_booking: {
    type: Boolean,
    default: false
  },
  activity_cancellation: {
    type: Boolean,
    default: false
  },
  visa_booking: {
    type: Boolean,
    default: false
  },
  visa_cancellation: {
    type: Boolean,
    default: false
  },
  query: {
    type: Boolean,
    default: false
  }
});

const emails = new mongoose.Schema({
  birthday: {
    type: Boolean,
    default: false
  },
  anniversary: {
    type: Boolean,
    default: false
  },
  followup_reminder: {
    type: Boolean,
    default: false
  },
  lead_allocation: {
    type: Boolean,
    default: false
  },
  quotation_sharing: {
    type: Boolean,
    default: false
  },
  quotation_replay: {
    type: Boolean,
    default: false
  },
  auto_invoice: {
    type: Boolean,
    default: false
  },
  manual_invoice: {
    type: Boolean,
    default: false
  },
  customer_payment_reminder: {
    type: Boolean,
    default: false
  },
  supplier_payment_receipt: {
    type: Boolean,
    default: false
  },
  hotel_voucher: {
    type: Boolean,
    default: false
  },
  transfer_voucher: {
    type: Boolean,
    default: false
  },
  booking_confirmation_letter: {
    type: Boolean,
    default: false
  },
  other_service_Quotation: {
    type: Boolean,
    default: false
  },
  web_leads: {
    type: Boolean,
    default: false
  },
  trip_reminder: {
    type: Boolean,
    default: false
  },
  notify_customer: {
    type: Boolean,
    default: false
  },
  b2b_quotation_sharing: {
    type: Boolean,
    default: false
  },
  otp: {
    type: Boolean,
    default: false
  },
  account_registration: {
    type: Boolean,
    default: false
  },
  flight_booking: {
    type: Boolean,
    default: false
  },
  flight_cancellation: {
    type: Boolean,
    default: false
  },
  package_booking: {
    type: Boolean,
    default: false
  },
  package_cancellation: {
    type: Boolean,
    default: false
  },
  hotel_booking: {
    type: Boolean,
    default: false
  },
  hotel_cancellation: {
    type: Boolean,
    default: false
  },
  activity_booking: {
    type: Boolean,
    default: false
  },
  activity_cancellation: {
    type: Boolean,
    default: false
  },
  visa_booking: {
    type: Boolean,
    default: false
  },
  visa_cancellation: {
    type: Boolean,
    default: false
  },
  query: {
    type: Boolean,
    default: false
  }
});

const whatsapps = new mongoose.Schema({
  birthday: {
    type: Boolean,
    default: false
  },
  anniversary: {
    type: Boolean,
    default: false
  },
  followup_reminder: {
    type: Boolean,
    default: false
  },
  lead_allocation: {
    type: Boolean,
    default: false
  },
  quotation_sharing: {
    type: Boolean,
    default: false
  },
  quotation_replay: {
    type: Boolean,
    default: false
  },
  auto_invoice: {
    type: Boolean,
    default: false
  },
  manual_invoice: {
    type: Boolean,
    default: false
  },
  customer_payment_reminder: {
    type: Boolean,
    default: false
  },
  supplier_payment_receipt: {
    type: Boolean,
    default: false
  },
  hotel_voucher: {
    type: Boolean,
    default: false
  },
  transfer_voucher: {
    type: Boolean,
    default: false
  },
  booking_confirmation_letter: {
    type: Boolean,
    default: false
  },
  other_service_Quotation: {
    type: Boolean,
    default: false
  },
  web_leads: {
    type: Boolean,
    default: false
  },
  trip_reminder: {
    type: Boolean,
    default: false
  },
  notify_customer: {
    type: Boolean,
    default: false
  },
  b2b_quotation_sharing: {
    type: Boolean,
    default: false
  },
  otp: {
    type: Boolean,
    default: false
  },
  account_registration: {
    type: Boolean,
    default: false
  },
  flight_booking: {
    type: Boolean,
    default: false
  },
  flight_cancellation: {
    type: Boolean,
    default: false
  },
  package_booking: {
    type: Boolean,
    default: false
  },
  package_cancellation: {
    type: Boolean,
    default: false
  },
  hotel_booking: {
    type: Boolean,
    default: false
  },
  hotel_cancellation: {
    type: Boolean,
    default: false
  },
  activity_booking: {
    type: Boolean,
    default: false
  },
  activity_cancellation: {
    type: Boolean,
    default: false
  },
  visa_booking: {
    type: Boolean,
    default: false
  },
  visa_cancellation: {
    type: Boolean,
    default: false
  },
  query: {
    type: Boolean,
    default: false
  }
});

const notification_setting_schema = new mongoose.Schema(
  {
    sms: {
      type: s_m_s,
      required: true
    },
    email: {
      type: emails,
      required: true
    },
    whatsapp: {
      type: whatsapps,
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

notification_setting_schema.plugin(aggregatePaginate);
notification_setting_schema.plugin(mongoosePaginate);
const notification_setting_Schema = new mongoose.model("notification_setting", notification_setting_schema);

module.exports = notification_setting_Schema;
