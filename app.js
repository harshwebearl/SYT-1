require('dotenv').config();
const debug = require('debug')('start-your-tour:app');
debug('Debug: Starting app.js execution');

const isAuth = require("./middleware/isAuth.js");
debug('Debug: Loaded isAuth middleware');
const cors = require("cors");
debug('Debug: Loaded cors module');
const createError = require("http-errors");
debug('Debug: Loaded http-errors module');
const express = require("express");
debug('Debug: Loaded express module');
const path = require("path");
debug('Debug: Loaded path module');
const cookieParser = require("cookie-parser");
debug('Debug: Loaded cookie-parser module');
const logger = require("morgan");
debug('Debug: Loaded morgan logger module');

// const swaggerUi = require('swagger-ui-express')
// const swaggerFile = require('./spec.json')
// const swaggerFile = require('./swagger-output.json')
// const expressOasGenerator = require('express-oas-generator');
// debug('Debug: Swagger modules commented out');

debug('Debug: Loading route modules');
const testRouter = require("./routes/Test");
const adminRouter = require("./routes/Admin.Route");
const agencyRouter = require("./routes/Agency.Route");
const serviceRouter = require("./routes/Service.Route");
const policyRouter = require("./routes/Policy.Route");
const customerRouter = require("./routes/customer.Route");
const packageRouter = require("./routes/Package.Route");
const ItinerarySchema = require("./routes/Itinerary.Route");
const Destination = require("./routes/Destination.Route");
const DestinationCategory = require("./routes/DestinationCategory.Route");
const PlaceToVisit = require("./routes/Placetovisit.Route");
const CustomRequirement = require("./routes/CustomRequirement.Route");
const BidPackage = require("./routes/BidPackage.Route");
const notification = require("./routes/Notification.Router");
const SafetyInfoRouter = require("./routes/Saftyinfo.Router");
const travelBy = require("./routes/TravelBy.Route");
const MealType = require("./routes/Meal_Type.Router");
const hotelType = require("./routes/HotelType.Route");
const meal = require("./routes/Meal.Route");
const TransactionRouter = require("./routes/Transaction.Router");
const book_packageRouter = require("./routes/book_package.router");
const book_package_itinerary_Router = require("./routes/book_package_itinerary.Router");
const reviewRouter = require("./routes/reviewRouter");
const homepagerouter = require("./routes/homepage.router");
// const leads_router = require("./routes/lead.Router");
const invoice_router = require("./routes/invoice.Router");
const ExportToExcelRouter = require("./routes/ExportToExcel.Router");
const DescriptionRouter = require("./routes/Description.Router");
const sub_role_router = require("./routes/sub_role_router");
const user_router = require("./routes/user.Router");
const lead_status_router = require("./routes/lead_status_router");
const source_router = require("./routes/source.Router");
const invoice_tax_router = require("./routes/invoice_tax_router");
const branches_router = require("./routes/branches.Router");
const document_type_router = require("./routes/document_type_router");
const room_type_router = require("./routes/room_type.Router");
const room_categories_router = require("./routes/room_categoriesRouter");
const room_occupancie_router = require("./routes/room_occupancies_router");
const coupons_router = require("./routes/coupons.Router");
const location_router = require("./routes/location.Router");
const hotel_type_router = require("./routes/hotel_type.Router");
const pkg_hotel_type_router = require("./routes/pkg_hotel_type.Router");
const transfer_type_router = require("./routes/transfer_type.Router");
const currencies_router = require("./routes/currencies.Router");
const amenities_router = require("./routes/amenities.Router");
const categories_router = require("./routes/categories.Router");
const facilities_router = require("./routes/facilities.Router");
const specialization_router = require("./routes/specialization.Router");
const popular_hotel_router = require("./routes/popular_hotel.Router");
const service_2_router = require("./routes/service_2.Router");
const suppliers_router = require("./routes/suppliers.Router");
const booking_policies_router = require("./routes/booking_policies.Router");
const room_router = require("./routes/room.Router");
const pkg_room_router = require("./routes/pkg_hotel_room_inventory.Router");
const hotel_router = require("./routes/hotel.Router");
const pkg_hotel_router = require("./routes/pkg_hotel.Router");
const flight_route_router = require("./routes/flight_routers.Router");
const dynamic_discounting_router = require("./routes/dynamic_discounting.Route");
const cfar_router = require("./routes/Cfar.Router");
const flight_commission_router = require("./routes/flight_commission.Router");
const profile_setting_router = require("./routes/profile_setting.Router");
const quotation_email_router = require("./routes/Quotation_email.Router");
const member_router = require("./routes/member.Router");
const notification_message_master_router = require("./routes/notification_message_master_Router");
const customer_group_router = require("./routes/customer_group.Router");
const customer_2_router = require("./routes/customer_2_Router");
const setting_booking_restriction_router = require("./routes/setting_booking_restriction.Router");
const setting_payment_gateway_router = require("./routes/setting_payment_gateway.Router");
const bulk_followup_router = require("./routes/bulk_followup.Router");
const notification_setting_router = require("./routes/notification_setting_Router");
const flight_booking_router = require("./routes/flight_booking.Router");
const meal_plan_router = require("./routes/meal_plan.Router");
const flight_router = require("./routes/flight.Router");
const flight_detail_router = require("./routes/flight_details.Router");
const cms_banner_router = require("./routes/cms_banners.Router");
const cms_special_package_router = require("./routes/cms_special_package.Router");
const cms_similar_packages_router = require("./routes/cms_similar_packages.Router");
const cms_testimonial_router = require("./routes/cms_testimonials.Router");
const cms_gallery_router = require("./routes/cms_gallery.Router");
const cms_aboutus_router = require("./routes/cms_aboutus.Router");
const cms_setting_seo = require("./routes/cms_settings_seo.Router");
const cms_entry_type_router = require("./routes/cms_entry_type.Router");
const cms_visa_type_router = require("./routes/cms_visa_type.Router");
const cms_destination_related_packages_router = require("./routes/cms_destination_related_packages.Route");
const cms_visa_booking_router = require("./routes/cms_visa_booking.Router");
const auto_car_router = require("./routes/auto_car.Router");
const cms_cars_router = require("./routes/cms_cars.Router");
const cms_contactus_router = require("./routes/cms_contactus.Router");
const cms_website_setting_router = require("./routes/cms_website_setting.Router");
const cms_destination_router = require("./routes/cms_destination.Router");
const cms_activities_router = require("./routes/cms_activities.Router");
const package_1_router = require("./routes/packages_1_Router");
const QuotationRouter = require("./routes/quotation.router.js");
const cms_blogs_router = require("./routes/cms_blogs.Router");
const cms_pages_router = require("./routes/cms_pages.Router");
const cms_visa_router = require("./routes/cms_visa.Router");
const supplier_payment_router = require("./routes/supplier_payment.Router");
const lead_booking_Router = require("./routes/lead_booking.Router");
const invoice_setting_Router = require("./routes/invoice_setting.Router");
const hotel_booking_router = require("./routes/hotel_booking.Router");
const pkg_booking_policy_mapping = require("./routes/pkg_booking_policy_mapping.router");
const cms_settings_homepage_router = require("./routes/cms_settings_homepage.Router");
const cms_services_router = require("./routes/cms_services.Router");
const BulkRouter = require("./routes/Bulk.Router");
const RemindersRouter = require("./routes/reminders.router.js");
const TimelineRouter = require("./routes/timeline.router.js");
const PseRouter = require("./routes/pse.Router.js");
const slider_router = require("./routes/slider.Router");
const visa_on_Arrival_router = require("./routes/visa_on_arrival.Router");
const hotel_syt_router = require("./routes/hotel_syt_router.js");
const room_syt_router = require("./routes/room_syt_router.js");
const highlight_router = require("./routes/highlights_router.js");
const property_policies_router = require("./routes/properties_policies_router.js");
const amenities_and_facilities_syt_router = require("./routes/amenities_and_facilities_syt_router.js");
const hotel_booking_syt_router = require("./routes/hotel_book_syt_router.js");
const cancel_hotel_booking_syt_router = require("./routes/cancel_hotel_booking_syt_router.js");
const blogger_syt_router = require("./routes/blogger_syt_router.js");
const subscribe_syt_router = require("./routes/Subscribe_Syt_router.js");
const business_type_router = require("./routes/business_type_router.js");
const faq_router = require("./routes/faq_router.js");
const about_router = require("./routes/about_router.js");
const hotel_review_router = require("./routes/hotel_review_router");
const lead_router = require("./routes/Lead.route.js");
const customer_details_router = require("./routes/customer_details_router.js");
const customer_document_router = require("./routes/customer_document_router.js");
const payment_router = require("./routes/payment_router.js");
const vendor_car_router = require("./routes/vendor_car_router.js");
const car_syt_router = require("./routes/car_syt_router.js");
const car_booking_syt_router = require("./routes/car_booking_router.js");
const career_category_router = require("./routes/career_category_router");
const career_router = require("./routes/career_router");
const membership_feature_router = require("./routes/membership_feature_router");
const membership_plan_router = require("./routes/membership_plan_router");
const hotel_itienrary_router = require("./routes/hotel_itienrary_router.js");
const packageProfitMargin = require("./routes/package_profit_margin_router.js");
const inquiryRouter = require("./routes/inquiry_router.js");
const room_price_router = require("./routes/room_price_router.js");
debug('Debug: All route modules loaded successfully');

const mongoose = require("./config/db");
debug('Debug: MongoDB connection initiated');

// const modelNames = mongoose.modelNames();
// debug('Debug: Mongoose model names retrieved');

const { app } = require("./socket/socket");
debug('Debug: Imported app from socket/socket.js');

// expressOasGenerator.handleResponses(app, {
//   predefinedSpec: function (spec) { return spec; },
//   specOutputPath: './spec.json',
//   mongooseModels: modelNames,
//   alwaysServeDocs: true,
//   specOutputFileBehavior: "RECREATE",
// });
// app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile, { explorer: false }))
// debug('Debug: Swagger setup commented out');

// Middleware for CORS
app.use(cors());
debug('Debug: CORS middleware applied');

// Middleware to Authorize Requests
app.use(isAuth);
debug('Debug: isAuth middleware applied');

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
debug('Debug: EJS view engine configured');

app.use(logger("dev"));
debug('Debug: Morgan logger middleware applied');
// app.use(require("morgan")("combined", { "stream": logger.stream }));
// app.use(require("morgan")("combined", { stream: { write: message => logger.info(message) } }));
app.use(express.json());
debug('Debug: JSON body parser middleware applied');
app.use(express.urlencoded({ extended: false }));
debug('Debug: URL-encoded body parser middleware applied');
// app.use(cookieParser());
// debug('Debug: Cookie parser middleware commented out');
// app.use(multer().any());
// debug('Debug: Multer middleware commented out');

// Serve Static Assets
app.use("/", express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));
debug('Debug: Static asset routes configured');
app.get("/", async (req, res) => {
  debug('Debug: Root route handler called');
  res.send("Welcome");
});

// Route middleware
debug('Debug: Registering route middleware');
app.use("/test", testRouter);
app.use("/admin", adminRouter);
app.use("/agency", agencyRouter);
app.use("/service", serviceRouter);
app.use("/policy", policyRouter);
app.use("/user", customerRouter);
app.use("/package", packageRouter);
app.use("/itinerary", ItinerarySchema);
app.use("/destination", Destination);
app.use("/destinationcategory", DestinationCategory);
app.use("/placetovisit", PlaceToVisit);
app.use("/customrequirements", CustomRequirement);
app.use("/bidpackage", BidPackage);
app.use("/notification", notification);
app.use("/safetyinfo", SafetyInfoRouter);
app.use("/travelby", travelBy);
app.use("/mealtype", MealType);
app.use("/hoteltype", hotelType);
app.use("/meal", meal);
app.use("/transaction", TransactionRouter);
app.use("/bookpackage", book_packageRouter);
app.use("/bookpackageitinerary", book_package_itinerary_Router);
app.use("/review", reviewRouter);
app.use("/home", homepagerouter);
// app.use("/lead", leads_router);
app.use("/invoice", invoice_router);
app.use("/export", ExportToExcelRouter);
app.use("/description", DescriptionRouter);
app.use("/subrole", sub_role_router);
app.use("/user", user_router);
app.use("/leadstatus", lead_status_router);
app.use("/source", source_router);
app.use("/invoicetax", invoice_tax_router);
app.use("/branches", branches_router);
app.use("/documenttype", document_type_router);
app.use("/roomtype", room_type_router);
app.use("/roomcategories", room_categories_router);
app.use("/room_occupancie", room_occupancie_router);
app.use("/coupon", coupons_router);
app.use("/location", location_router);
app.use("/hotel_type", hotel_type_router);
app.use("/pkg_hotel_type", pkg_hotel_type_router);
app.use("/transfer_type", transfer_type_router);
app.use("/currencies", currencies_router);
app.use("/amenities", amenities_router);
app.use("/categories", categories_router);
app.use("/facilities", facilities_router);
app.use("/specialization", specialization_router);
app.use("/popular_hotel", popular_hotel_router);
app.use("/service_2", service_2_router);
app.use("/suppliers", suppliers_router);
app.use("/booking_policies", booking_policies_router);
app.use("/room", room_router);
app.use("/pkg_room", pkg_room_router);
app.use("/hotel", hotel_router);
app.use("/pkg_hotel", pkg_hotel_router);
app.use("/flight_route", flight_route_router);
app.use("/dynamic_discounting", dynamic_discounting_router);
app.use("/cfar", cfar_router);
app.use("/flight_commission", flight_commission_router);
app.use("/profile_setting", profile_setting_router);
app.use("/quotation_email", quotation_email_router);
app.use("/member", member_router);
app.use("/notification_message_master", notification_message_master_router);
app.use("/customer_group", customer_group_router);
app.use("/customer_2", customer_2_router);
app.use("/setting_booking_restriction", setting_booking_restriction_router);
app.use("/setting_payment_gateway", setting_payment_gateway_router);
app.use("/bulk_followup", bulk_followup_router);
app.use("/notification_setting", notification_setting_router);
app.use("/flight_booking", flight_booking_router);
app.use("/meal_plan", meal_plan_router);
app.use("/flight", flight_router);
app.use("/flight_detail", flight_detail_router);
app.use("/cms_banner", cms_banner_router);
app.use("/cms_special_package", cms_special_package_router);
app.use("/cms_similar_packages", cms_similar_packages_router);
app.use("/cms_testimonial", cms_testimonial_router);
app.use("/cms_gallery", cms_gallery_router);
app.use("/cms_aboutus", cms_aboutus_router);
app.use("/cms_setting_seo", cms_setting_seo);
app.use("/cms_entry_type", cms_entry_type_router);
app.use("/cms_visa_type", cms_visa_type_router);
app.use("/cms_destination_related_packages", cms_destination_related_packages_router);
app.use("/cms_visa_booking", cms_visa_booking_router);
app.use("/auto_car", auto_car_router);
app.use("/cms_cars", cms_cars_router);
app.use("/cms_contactus", cms_contactus_router);
app.use("/cms_website_setting", cms_website_setting_router);
app.use("/cms_destination", cms_destination_router);
app.use("/cms_activities", cms_activities_router);
app.use("/package_1", package_1_router);
app.use("/quotation", QuotationRouter);
app.use("/cms_blogs", cms_blogs_router);
app.use("/cms_pages", cms_pages_router);
app.use("/cms_visa", cms_visa_router);
app.use("/supplier_payment", supplier_payment_router);
app.use("/lead_booking", lead_booking_Router);
app.use("/invoice_setting", invoice_setting_Router);
app.use("/hotel_booking", hotel_booking_router);
app.use("/pkg_booking_policy_mapping", pkg_booking_policy_mapping);
app.use("/cms_settings_homepage", cms_settings_homepage_router);
app.use("/cms_services", cms_services_router);
app.use("/bulk", BulkRouter);
app.use("/reminders", RemindersRouter);
app.use("/timeline", TimelineRouter);
app.use("/pse", PseRouter);
app.use("/slider", slider_router);
app.use("/visa_on_Arrival", visa_on_Arrival_router);
app.use("/hotel_syt", hotel_syt_router);
app.use("/room_syt", room_syt_router);
app.use("/highlight", highlight_router);
app.use("/property_policies", property_policies_router);
app.use("/amenities_and_facilities", amenities_and_facilities_syt_router);
app.use("/hotel_booking_syt", hotel_booking_syt_router);
app.use("/cancel_hotel_booking_syt", cancel_hotel_booking_syt_router);
app.use("/blogger", blogger_syt_router);
app.use("/subscribe", subscribe_syt_router);
app.use("/businesstype", business_type_router);
app.use("/faqs", faq_router);
app.use("/about", about_router);
app.use("/hotel_review", hotel_review_router);
app.use("/lead", lead_router);
app.use("/customer_details", customer_details_router);
app.use("/customer_document", customer_document_router);
app.use("/payment", payment_router);
app.use("/vendor_car_syt", vendor_car_router);
app.use("/car_syt", car_syt_router);
app.use("/car_booking_syt", car_booking_syt_router);
app.use("/api/career_category", career_category_router);
app.use("/api/career", career_router);
app.use("/api/membership_feature", membership_feature_router);
app.use("/api/membership_plan", membership_plan_router);
app.use("/api/hotel_itienrary", hotel_itienrary_router);
app.use("/api/package_profit_margin", packageProfitMargin);
app.use("/api/inquiry", inquiryRouter);
app.use("/api/room_price", room_price_router);
debug('Debug: All route middleware registered');

// 404 handler
app.use(function (req, res, next) {
  debug(`Debug: 404 handler triggered for ${req.method} ${req.url}`);
  console.log("404:NotFound");
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  debug(`Debug: Error handler triggered: ${err.message}, Status: ${err.status || 500}`);
  console.log("ErrorHandler");
  // Set locals, only providing error in development
  res.locals.message = err.message;
  // res.locals.error = req.app.get("env") === "development" ? err : {};
  res.locals.error = err;

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

// expressOasGenerator.handleRequests();
// debug('Debug: expressOasGenerator.handleRequests commented out');

debug('Debug: app.js configuration completed');
module.exports = app;