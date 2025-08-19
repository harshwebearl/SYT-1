const mongoose = require("mongoose");
let aggregatePaginate = require("mongoose-aggregate-paginate-v2");
let mongoosePaginate = require("mongoose-paginate-v2");

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

const permission = new mongoose.Schema({
  location: {
    city: {
      type: Boolean,
      default: false
      // required:true
    }
  },
  cms: {
    banner: {
      type: Boolean,
      //   required: true,
      default: false
    },
    special_package: {
      type: Boolean,
      // required: true,
      default: false
    },
    similar_package: {
      type: Boolean,
      // required: true
      default: false
    },
    testimonial: {
      type: Boolean,
      // required: true
      default: false
    },
    image_gallery: {
      type: Boolean,
      // required: true
      default: false
    },
    manage_services: {
      type: Boolean,
      // required: true
      default: false
    },
    manage_aboutus: {
      type: Boolean,
      // required: true
      default: false
    },
    manage_contectus: {
      type: Boolean,
      // required: true
      default: false
    },
    manage_homepage_settings: {
      type: Boolean,
      // required: true
      default: false
    },
    seo_settings: {
      type: Boolean,
      // required: true
      default: false
    },
    destination: {
      type: Boolean,
      // required: true
      default: false
    },
    activities: {
      type: Boolean,
      // required: true
      default: false
    },
    destination_packages: {
      type: Boolean,
      // required: true
      default: false
    },
    blogs: {
      type: Boolean,
      // required: true
      default: false
    },
    add_pages: {
      type: Boolean,
      // required: true
      default: false
    },
    website_settings: {
      type: Boolean,
      // required: true
      default: false
    },
    cars: {
      type: Boolean,
      // required: true
      default: false
    },
    auto_car: {
      type: Boolean,
      // required: true
      default: false
    },
    visa: {
      type: Boolean,
      // required: true
      default: false
    },
    visa_type: {
      type: Boolean,
      // required: true
      default: false
    },
    visa_booking: {
      type: Boolean,
      // required: true
      default: false
    },
    entry_type: {
      type: Boolean,
      // required: true
      default: false
    }
  },
  suppliers: {
    services: {
      type: Boolean,
      default: false
      // required: true
    },
    suppliers: {
      type: Boolean,
      // required: true
      default: false
    },
    suppliers_payment: {
      type: Boolean,
      // required: true
      default: false
    }
  },
  hotels: {
    amenities: {
      type: Boolean,
      // required: true
      default: false
    },
    facilities: {
      type: Boolean,
      // required: true
      default: false
    },
    hotel_type: {
      type: Boolean,
      // required: true
      default: false
    },
    hotel: {
      type: Boolean,
      // required: true
      default: false
    },
    room_type: {
      type: Boolean,
      // required: true
      default: false
    },
    room: {
      type: Boolean,
      // required: true
      default: false
    },
    popular_hotels: {
      type: Boolean,
      // required: true
      default: false
    },
    bookings: {
      type: Boolean,
      // required: true
      default: false
    },
    hotel_cancellations: {
      type: Boolean,
      // required: true
      default: false
    }
  },
  packages: {
    category: {
      type: Boolean,
      // required: true
      default: false
    },
    specialization: {
      type: Boolean,
      // required: true
      default: false
    },
    hotel_type: {
      type: Boolean,
      // required: true
      default: false
    },
    room_occupancy: {
      type: Boolean,
      // required: true
      default: false
    },
    room_category: {
      type: Boolean,
      // required: true
      default: false
    },
    transfer_type: {
      type: Boolean,
      // required: true
      default: false
    },
    packages: {
      type: Boolean,
      // required: true
      default: false
    },
    hotel_room_inventory: {
      type: Boolean,
      // required: true
      default: false
    },
    manage_hotel: {
      type: Boolean,
      // required: true
      default: false
    },
    booking_policy: {
      type: Boolean,
      // required: true
      default: false
    },
    package_booking_policy: {
      type: Boolean,
      // required: true
      default: false
    },
    package_booking: {
      type: Boolean,
      // required: true
      default: false
    }
  },
  leads: {
    sources: {
      type: Boolean,
      // required: true
      default: false
    },
    lead_status: {
      type: Boolean,
      // required: true
      default: false
    },
    add_leads: {
      type: Boolean,
      // required: true
      default: false
    },
    lead_allocation: {
      type: Boolean,
      // required: true
      default: false
    },
    all_leads: {
      type: Boolean,
      // required: true
      default: false
    },
    opportunity: {
      type: Boolean,
      // required: true
      default: false
    },
    booking: {
      type: Boolean,
      // required: true
      default: false
    },
    completed: {
      type: Boolean,
      // required: true
      default: false
    },
    cancelled: {
      type: Boolean,
      // required: true
      default: false
    }
  },
  invoice: {
    invoice_settings: {
      type: Boolean,
      default: false
      // required: true
    },
    taxes: {
      type: Boolean,
      // required: true
      default: false
    },
    invoices: {
      type: Boolean,
      default: false
      // required: true
    }
  },
  reports: {
    lead_performance_report: {
      type: Boolean,
      default: false
      // required: true
    },
    supplier_payment_report: {
      type: Boolean,
      default: false
      // required: true
    },
    customer_payment_report: {
      type: Boolean,
      default: false
      // required: true
    },
    ITC_report: {
      type: Boolean,
      default: false
      // required: true
    },
    profit_and_loss_report: {
      type: Boolean,
      default: false
      // required: true
    },
    lead_summary_report: {
      type: Boolean,
      default: false
      // required: true
    },
    lead_cancellation_report: {
      type: Boolean,
      default: false
      // required: true
    },
    bad_debts_report: {
      type: Boolean,
      default: false
      // required: true
    },
    FD_reports: {
      type: Boolean,
      default: false
      // required: true
    },
    fight_sales_report: {
      type: Boolean,
      default: false
      // required: true
    },
    // fight_sales_report: {
    //   type: Boolean,
    //   default: false
    //   // required: true
    // },
    ledger_reports: {
      type: Boolean,
      default: false
      // required: true
    }
  },
  fixed_departure: {
    bookings: {
      type: Boolean,
      default: false
      // required: true
    },
    flights: {
      type: Boolean,
      default: false
      // required: true
    },
    FD_cancelation: {
      type: Boolean,
      default: false
      // required: true
    }
  },
  flight: {
    bookings: {
      type: Boolean,
      default: false
      // required: true
    },
    cancellations: {
      type: Boolean,
      default: false
      // required: true
    },
    flights_markup: {
      type: Boolean,
      default: false
      // required: true
    },
    flight_booking_queue: {
      type: Boolean,
      default: false
      // required: true
    },
    flight_booking_request: {
      type: Boolean,
      default: false
      // required: true
    },
    series_fare: {
      type: Boolean,
      default: false
      // required: true
    },
    popular_segments: {
      type: Boolean,
      default: false
      // required: true
    },
    coupon_on_airline: {
      type: Boolean,
      default: false
      // required: true
    },
    coupon_on_amount: {
      type: Boolean,
      default: false
      // required: true
    },
    coupon_on_customer: {
      type: Boolean,
      default: false
      // required: true
    },
    coupon_on_occassion: {
      type: Boolean,
      default: false
      // required: true
    },
    CFAR: {
      type: Boolean,
      default: false
      // required: true
    },
    dynamic_discounting: {
      type: Boolean,
      default: false
      // required: true
    }
  },
  engagement: {
    bulk_followup: {
      type: Boolean,
      default: false
      // required: true
    }
  },
  settings: {
    profile_settings: {
      type: Boolean,
      default: false
      // required: true
    },
    quotation_email_settings: {
      type: Boolean,
      default: false
      // required: true
    },
    roles: {
      type: Boolean,
      default: false
      // required: true
    },
    roles_permissions: {
      type: Boolean,
      default: false
      // required: true
    },
    members: {
      type: Boolean,
      default: false
      // required: true
    },
    customers: {
      type: Boolean,
      default: false
      // required: true
    },
    doc_type: {
      type: Boolean,
      default: false
      // required: true
    },
    currency: {
      type: Boolean,
      default: false
      // required: true
    },
    booking_restriction_setting: {
      type: Boolean,
      default: false
      // required: true
    },
    branches: {
      type: Boolean,
      default: false
      // required: true
    },
    quotation_theme_settings: {
      type: Boolean,
      default: false
      // required: true
    },
    payment_geteway_setting: {
      type: Boolean,
      default: false
      // required: true
    },
    notification_settings: {
      type: Boolean,
      default: false
      // required: true
    },
    notification_message_master: {
      type: Boolean,
      default: false
      // required: true
    },
    api_clients: {
      type: Boolean,
      default: false
      // required: true
    },
    api_wallet: {
      type: Boolean,
      default: false
      // required: true
    },
    fund_request: {
      type: Boolean,
      default: false
      // required: true
    },
    customer_group: {
      type: Boolean,
      default: false
      // required: true
    },
    schedule_fresh_lead: {
      type: Boolean,
      default: false
      // required: true
    },
    support_PSE: {
      type: Boolean,
      default: false
      // required: true
    }
  },
  bookings: {
    activity_booking: {
      type: Boolean,
      default: false
      // required: true
    },
    activity_cancellation_request: {
      type: Boolean,
      default: false
      // required: true
    },
    activity_cancelled: {
      type: Boolean,
      default: false
      // required: true
    }
  },
  coupons: {
    global_coupons: {
      type: Boolean,
      default: false
      // required: true
    }
  }
});

const sub_role_schema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    sub_role_name: {
      type: String,
      required: true
    },
    permissions: mongoose.Schema.Types.Mixed,
    permission: {
      type: permission,
      default: null
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

sub_role_schema.plugin(aggregatePaginate);
sub_role_schema.plugin(mongoosePaginate);
const sub_role_Schema = new mongoose.model("sub_role", sub_role_schema);

module.exports = sub_role_Schema;
