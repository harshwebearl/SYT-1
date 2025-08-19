const mongoose = require("mongoose");
const Payment = require("../models/payment");
const axios = require("axios");
const uniqid = require("uniqid");
const sha256 = require("sha256");
const TransactonSchema = require("../models/TransactionSchema");
const bookpackageschema = require("../models/bookpackageschema");
const { MERCHANT_ID } = process.env;
const { SALT_KEY } = process.env;
const SALT_KEY_INDEX = 1;
const HOST_URI = "https://api.phonepe.com/apis/hermes";
const PAY_URI = "/pg/v1/pay";
const CustomRequirementSchema = require("../models/custom_requirementsSchema.js");
const package_profit_margin = require("../models/package_profit_margin.js");
const destinationSchema = require("../models/DestinationSchema.js");
const packageSchema = require("../models/PackageSchema.js");
const payment = require("../models/payment");
const userschema = require("../models/usersSchema.js");
const hotel_booking_syt_Schema = require("../models/hotel_booking_syt_schema");
const Bidschema = require("../models/bidSchema");
const Notificationschema = require("../models/NotificationSchema.js");
const agencySchema = require("../models/Agency_personalSchema.js");
const hotel_model = require("../models/hotel_syt_schema.js");
const { getReceiverSocketId, io } = require("../socket/socket.js");
const car_booking_syt = require("../models/car_booking_syt.js");

// exports.initiate_payment = async (req, res) => {
//     try {
//         const {
//             MERCHANT_USER_ID,
//             amount,
//             mobileNumber,
//             link,
//             custom_requirement_id,
//             bid_id,
//             package_id,
//             room_id,
//             hotel_id,
//             vendor_car_id,
//         } = req.body;
//         const merchantTransactionId = uniqid();

//         const payload = {
//             merchantId: MERCHANT_ID,
//             merchantTransactionId: merchantTransactionId,
//             merchantUserId: MERCHANT_USER_ID,
//             amount: amount * 100, // paisa
//             // redirectUrl: `https://start-your-tour-1yzk.onrender.com${link}/${merchantTransactionId}`,
//             redirectUrl: `http://localhost:3000${link}/${merchantTransactionId}`,
//             redirectMode: "REDIRECT",
//             mobileNumber: mobileNumber,
//             paymentInstrument: {
//                 type: "PAY_PAGE",
//             },
//         };

//         const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
//         const base64Payload = bufferObj.toString("base64");

//         const xVerify =
//             sha256(base64Payload + PAY_URI + SALT_KEY) + "###" + SALT_KEY_INDEX;

//         const options = {
//             method: "post",
//             url: `${HOST_URI}${PAY_URI}`,
//             headers: {
//                 accept: "application/json",
//                 "Content-Type": "application/json",
//                 "X-VERIFY": xVerify,
//             },
//             data: {
//                 request: base64Payload,
//             },
//         };

//         const paymentData = await TransactonSchema.create({
//             user_id: MERCHANT_USER_ID,
//             custom_requirement_id,
//             package_id,
//             bid_id,
//             trnsaction_id: merchantTransactionId,
//             status: "pending",
//             amount,
//             room_id,
//             hotel_id,
//             vendor_car_id
//         });

//         // const bookingData = await bookpackageschema.create({
//         //     user_registration_id: MERCHANT_USER_ID,
//         //     bookdate: Date.now(),
//         //     payment_type: req.body.payment_type,
//         //     bid_package_id: req.body.bid_package_id,
//         //     transaction_id: req.body.transaction_id,
//         //     package_id: req.body.package_id,
//         //     total_adult: req.body.total_adult,
//         //     total_child: req.body.total_child,
//         //     total_infant: req.body.total_infant,
//         //     contact_number: req.body.contact_number,
//         //     email_id: req.body.email_id,
//         //     agency_contect_no: req.body.agency_contect_no,
//         //     total_person: req.body.total_person,
//         //     approx_start_date: req.body.approx_start_date,
//         //     totaldays: req.body.totaldays,
//         //     totalnight: req.body.totalnight,
//         //     meal: req.body.meal,
//         //     meal_type: req.body.meal_type,
//         //     siteseeing: req.body.siteseeing,
//         //     transport_mode: req.body.transport_mode,
//         //     transport_include_exclude: req.body.transport_include_exclude,
//         //     hoteltype: req.body.hoteltype,
//         //     priceperperson: req.body.priceperperson,
//         //     category: req.body.category,
//         //     booked_include: req.body.booked_include,
//         //     booked_exclude: req.body.booked_exclude,
//         //     personal_care: req.body.personal_care,
//         //     othere_requirement: req.body.othere_requirement,
//         //     custom_package_id: req.body.custom_package_id,
//         //     departure: req.body.departure,
//         //     approx_end_date: req.body.approx_end_date,
//         //     user_name: req.body.user_name,
//         //     booked_itinerary: req.body.booked_itinerary,
//         //     state: req.body.state,
//         //     city: req.body.city,
//         //     price_per_person_child: req.body.price_per_person_child,
//         //     price_per_person_adult: req.body.price_per_person_adult,
//         //     price_per_person_infant: req.body.price_per_person_infant,
//         //     room_sharing: req.body.room_sharing,
//         //     total_amount: req.body.total_amount,
//         //     travel_details: req.body.travel_details,
//         //     gst_address: req.body.gst_address,
//         //     destination_arrival_date: req.body.destination_arrival_date,
//         //     payment: req.body.payment
//         // })

//         // console.log("Booking Data:", bookingData)

//         try {
//             const response = await axios.request(options);
//             console.log(response.data);
//             res.status(200).json({
//                 success: true,
//                 message: "payment initiated",
//                 data: {
//                     url: response.data.data.instrumentResponse.redirectInfo.url,
//                     merchantTransactionId: merchantTransactionId,
//                 },
//             });
//         } catch (error) {
//             await TransactonSchema.findOneAndUpdate(
//                 { _id: paymentData._id },
//                 { $set: { status: "failed" } }
//             );
//             console.error(error);
//             res.status(500).json({
//                 success: false,
//                 message: error.message,
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// exports.initiate_payment = async (req, res) => {
//     try {
//         const {
//             MERCHANT_USER_ID,
//             amount,
//             mobileNumber,
//             link,
//             custom_requirement_id,
//             bid_id,
//             package_id,
//             room_id,
//             hotel_id,
//             vendor_car_id,
//             // URL,
//             // All booking related fields
//             payment_type,
//             bid_package_id,
//             transaction_id,
//             // package_id,
//             total_adult,
//             total_child,
//             total_infant,
//             contact_number,
//             email_id,
//             agency_contect_no,
//             total_person,
//             approx_start_date,
//             totaldays,
//             totalnight,
//             meal,
//             meal_type,
//             siteseeing,
//             transport_mode,
//             transport_include_exclude,
//             hoteltype,
//             priceperperson,
//             category,
//             booked_include,
//             booked_exclude,
//             personal_care,
//             othere_requirement,
//             custom_package_id,
//             departure,
//             approx_end_date,
//             user_name,
//             booked_itinerary,
//             state,
//             city,
//             price_per_person_child,
//             price_per_person_adult,
//             price_per_person_infant,
//             room_sharing,
//             total_amount,
//             travel_details,
//             gst_address,
//             destination_arrival_date,
//             payment,
//             destination,
        

//         } = req.body;
//         const merchantTransactionId = uniqid();

//         const payload = {
//             merchantId: MERCHANT_ID,
//             merchantTransactionId: merchantTransactionId,
//             merchantUserId: MERCHANT_USER_ID,
//             amount: amount * 100, // paisa
//             redirectUrl: `http://localhost:3000${link}/${merchantTransactionId}`,
//             redirectMode: "REDIRECT",
//             mobileNumber: mobileNumber,
//             paymentInstrument: {
//                 type: "PAY_PAGE",
//             },
//         };

//         const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
//         const base64Payload = bufferObj.toString("base64");

//         const xVerify =
//             sha256(base64Payload + PAY_URI + SALT_KEY) + "###" + SALT_KEY_INDEX;

//         const options = {
//             method: "post",
//             url: `${HOST_URI}${PAY_URI}`,
//             headers: {
//                 accept: "application/json",
//                 "Content-Type": "application/json",
//                 "X-VERIFY": xVerify,
//             },
//             data: {
//                 request: base64Payload,
//             },
//         };

//         console.log("option:", options)

//         const paymentData = await TransactonSchema.create({
//             user_id: MERCHANT_USER_ID,
//             custom_requirement_id,
//             package_id,
//             bid_id,
//             trnsaction_id: merchantTransactionId,
//             status: "pending",
//             amount,
//             room_id,
//             hotel_id,
//             vendor_car_id
//         });

//         try {
//             const response = await axios.request(options);
//             console.log(response.data);
//             console.log("response:", response);

//             // Assume response.data contains the success indication, modify according to actual response
//             if (response.data && response.data.success) {
//                 // Create booking only if payment is successful
//                 const bookingData = await bookpackageschema.create({
//                     user_registration_id: MERCHANT_USER_ID,
//                     bookdate: Date.now(),
//                     payment_type,
//                     bid_package_id,
//                     transaction_id: merchantTransactionId,
//                     package_id,
//                     total_adult,
//                     total_child,
//                     total_infant,
//                     contact_number,
//                     email_id,
//                     agency_contect_no,
//                     total_person,
//                     approx_start_date,
//                     totaldays,
//                     totalnight,
//                     meal,
//                     meal_type,
//                     siteseeing,
//                     transport_mode,
//                     transport_include_exclude,
//                     hoteltype,
//                     priceperperson,
//                     category,
//                     booked_include,
//                     booked_exclude,
//                     personal_care,
//                     othere_requirement,
//                     custom_package_id,
//                     departure,
//                     approx_end_date,
//                     user_name,
//                     booked_itinerary,
//                     state,
//                     city,
//                     price_per_person_child,
//                     price_per_person_adult,
//                     price_per_person_infant,
//                     room_sharing,
//                     total_amount,
//                     travel_details,
//                     gst_address,
//                     destination_arrival_date,
//                     payment,
//                     destination
//                 });

//                 await CustomRequirementSchema.findByIdAndUpdate(req.body.custom_package_id, {
//                     status: "booked",
//                     Status_change_by: MERCHANT_USER_ID
//                 });

//                 console.log("Booking Data:", bookingData);

//                 res.status(200).json({
//                     success: true,
//                     message: "payment initiated",
//                     data: {
//                         url: response.data.data.instrumentResponse.redirectInfo.url,
//                         merchantTransactionId: merchantTransactionId,
//                     },
//                 });
//             } else {
//                 // Handle unsuccessful payment
//                 await TransactonSchema.findOneAndUpdate(
//                     { _id: paymentData._id },
//                     { $set: { status: "failed" } }
//                 );
//                 res.status(400).json({
//                     success: false,
//                     message: "Payment failed",
//                 });
//             }
//         } catch (error) {
//             await TransactonSchema.findOneAndUpdate(
//                 { _id: paymentData._id },
//                 { $set: { status: "failed" } }
//             );
//             console.error(error);
//             res.status(500).json({
//                 success: false,
//                 message: error.message,
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

exports.initiate_payment = async (req, res) => {
  try {
    const {
      MERCHANT_USER_ID,
      amount,
      mobileNumber,
      link,
      custom_requirement_id,
      package_id,
      room_id,
      hotel_id,
      user_id,
      vendor_car_id,
      paid_amount,
      // payment_type,
      title,
      bid_package_id,
      total_adult,
      total_child,
      total_infant,
      contact_number,
      email_id,
      agency_contect_no,
      total_person,
      approx_start_date,
      totaldays,
      totalnight,
      meal,
      meal_type,
      siteseeing,
      transport_mode,
      hoteltype,
      priceperperson,
      // category,
      booked_include,
      booked_exclude,
      personal_care,
      othere_requirement,
      departure,
      other_services_by_agency,
      approx_end_date,
      user_name,
      booked_itinerary,
      state,
      city,
      price_per_person_child,
      price_per_person_adult,
      price_per_person_infant,
      room_sharing,
      total_amount,
      travel_details,
      package_type,
      gst_address,
      destination_arrival_date,
      payment,
      destination,
      payment_type_on_booking,
      total_booked_rooms,
      check_in_date,
      check_out_date,
      paymemt_type,
      room_title,
      gender,
      country,
      dob,
      contact_no,
      breakfast_price,
      lunch_price,
      dinner_price,
      hotel_itinerary_array,
      transaction_id,
      pickup_address,
      drop_address,
      one_way_two_way,
      pickup_date,
      pickup_time,
      name,
      email,
      mobile_number,
      return_date,
      status,
      car_condition,
      model_year,
      insurance,
      registration_number,
      color,
      price_type,
      price_per_km,
      price_per_day,
      pincode,
      outStateAllowed,
      AC,
      total_days,
      return_time,
      breakfast,
      lunch,
      dinner,
      extra_bad,
      extra_food_array,
      drop_state,
      drop_city,
      pickup_state,
      pickup_city,
      gst_price
    } = req.body;

    // if (!title) return res.status(403).json({ success: false, message: "Title is required" });
    // if (!package_type) return res.status(403).json({ success: false, message: "Package type is required" });
    // if (!payment_type_on_booking) return res.status(403).json({ success: false, message: "Payment type on booking is required" });
    // if (!contact_number) return res.status(403).json({ success: false, message: "Valid contact number is required" });
    // if (!email_id) return res.status(403).json({ success: false, message: "Email ID is required" });
    // if (!approx_start_date) return res.status(403).json({ success: false, message: "Approx start date is required" });
    // if (!totaldays) return res.status(403).json({ success: false, message: "Total days are required" });
    // if (!totalnight) return res.status(403).json({ success: false, message: "Total nights are required" });
    // if (!meal) return res.status(403).json({ success: false, message: "Meal option is required" });
    // if (!meal_type) return res.status(403).json({ success: false, message: "Meal type is required" });
    // if (!siteseeing) return res.status(403).json({ success: false, message: "Site-seeing information is required" });
    // if (!transport_mode) return res.status(403).json({ success: false, message: "Transport mode is required" });
    // if (!hoteltype) return res.status(403).json({ success: false, message: "Hotel type is required" });
    // if (!total_person) return res.status(403).json({ success: false, message: "Total person count is required" });
    // if (!category) return res.status(403).json({ success: false, message: "Category is required" });
    // if (!booked_include) return res.status(403).json({ success: false, message: "Booked include details are required" });
    // if (!booked_exclude) return res.status(403).json({ success: false, message: "Booked exclude details are required" });
    // if (!othere_requirement) return res.status(403).json({ success: false, message: "Other requirements are required" });
    // if (!departure) return res.status(403).json({ success: false, message: "Departure details are required" });
    // if (!destination) return res.status(403).json({ success: false, message: "Destination is required" });
    // if (!approx_end_date) return res.status(403).json({ success: false, message: "Approx end date is required" });
    // if (!user_name) return res.status(403).json({ success: false, message: "User name is required" });
    // if (!state) return res.status(403).json({ success: false, message: "State is required" });
    // if (!city) return res.status(403).json({ success: false, message: "City is required" });
    // if (!room_sharing) return res.status(403).json({ success: false, message: "Room sharing option is required" });
    // if (!total_amount || total_amount <= 0) return res.status(403).json({ success: false, message: "Total amount is required" });
    // if (!booked_itinerary) return res.status(403).json({ success: false, message: "Booked itinerary is required" });
    // if (!destination_arrival_date) return res.status(403).json({ success: false, message: "Destination arrival date is required" });

    const merchantTransactionId = uniqid();

    // Get the current month name (e.g., January, February)
    const currentDate = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    const currentMonth = monthNames[currentDate.getMonth()];

    // Retrieve margin percentage for the current month based on the state
    let admin_margin_percentage = null;
    let admin_margin_price_adult = null;
    let admin_margin_price_child = null;
    let admin_margin_price_infant = null;
    let admin_margin_extra_bad = null;
    let category = null;

    if (package_id) {
      const packageData = await packageSchema.findOne({ _id: package_id });
      const destinationData = await destinationSchema.findOne({ _id: packageData.destination });
      const packageMargin = await package_profit_margin.findOne({ state_name: destinationData?.destination_name });

      category = packageData.destination_category_id;

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      const parsedDate = new Date(approx_start_date);
      const currentMonth = monthNames[parsedDate.getMonth()];

      if (packageMargin && packageMargin.month_and_margin_user) {
        const marginObj = packageMargin.month_and_margin_user.find((margin) => margin.month_name === currentMonth);

        if (marginObj) {
          const percentage = marginObj.margin_percentage / 100;
          const marginPercentagePriceForAdult = price_per_person_adult * percentage;
          const marginPercentagePriceForChild = price_per_person_child * percentage;
          const marginPercentagePriceForInfant = price_per_person_infant * percentage;

          admin_margin_percentage = marginObj.margin_percentage;
          admin_margin_price_adult = Math.round(marginPercentagePriceForAdult);
          admin_margin_price_child = Math.round(marginPercentagePriceForChild);
          admin_margin_price_infant = Math.round(marginPercentagePriceForInfant);

          // price_per_person_adult = Math.round(price_per_person_adult + marginPercentagePriceForAdult);
          // price_per_person_child = Math.round(price_per_person_child + marginPercentagePriceForChild);
          // price_per_person_infant = Math.round(price_per_person_infant + marginPercentagePriceForInfant);
        } else {
          // If margin for current month is not found, set admin margin to 0
          const percentage = 10 / 100;
          const marginPercentagePriceForAdult = price_per_person_adult * percentage;
          const marginPercentagePriceForChild = price_per_person_child * percentage;
          const marginPercentagePriceForInfant = price_per_person_infant * percentage;

          admin_margin_percentage = 10;
          admin_margin_price_adult = Math.round(marginPercentagePriceForAdult);
          admin_margin_price_child = Math.round(marginPercentagePriceForChild);
          admin_margin_price_infant = Math.round(marginPercentagePriceForInfant);

          // price_per_person_adult = Math.round(price_per_person_adult + marginPercentagePriceForAdult);
          // price_per_person_child = Math.round(price_per_person_child + marginPercentagePriceForChild);
          // price_per_person_infant = Math.round(price_per_person_infant + marginPercentagePriceForInfant);
        }
      } else {
        // If no packageMargin found, set admin margin to 0
        const percentage = 10 / 100;
        const marginPercentagePriceForAdult = price_per_person_adult * percentage;
        const marginPercentagePriceForChild = price_per_person_child * percentage;
        const marginPercentagePriceForInfant = price_per_person_infant * percentage;

        admin_margin_percentage = 10;
        admin_margin_price_adult = Math.round(marginPercentagePriceForAdult);
        admin_margin_price_child = Math.round(marginPercentagePriceForChild);
        admin_margin_price_infant = Math.round(marginPercentagePriceForInfant);
      }
    } else if (bid_package_id || custom_requirement_id) {
      console.log("destination ::", destination);
      const packageMargin = await package_profit_margin.findOne({ state_name: destination });
      const bidData = await Bidschema.findOne({ _id: bid_package_id });

      category = bidData.destination_category;

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];

      const parsedDate = new Date(approx_start_date);

      const currentMonth = monthNames[parsedDate.getMonth()];

      if (packageMargin && packageMargin.month_and_margin_user) {
        const marginObj = packageMargin.month_and_margin_user.find((margin) => margin.month_name === currentMonth);

        if (marginObj) {
          const percentage = marginObj.margin_percentage / 100;
          const marginPercentagePriceForAdult = bidData.price_per_person_adult * percentage;
          const marginPercentagePriceForChild = bidData.price_per_person_child * percentage;
          const marginPercentagePriceForInfant = bidData.price_per_person_infant * percentage;

          admin_margin_percentage = marginObj.margin_percentage;
          admin_margin_price_adult = Math.round(marginPercentagePriceForAdult);
          admin_margin_price_child = Math.round(marginPercentagePriceForChild);
          admin_margin_price_infant = Math.round(marginPercentagePriceForInfant);
        } else {
          // If margin for current month is not found, set admin margin to 0
          const percentage = 10 / 100;
          const marginPercentagePriceForAdult = bidData.price_per_person_adult * percentage;
          const marginPercentagePriceForChild = bidData.price_per_person_child * percentage;
          const marginPercentagePriceForInfant = bidData.price_per_person_infant * percentage;

          admin_margin_percentage = 10;
          admin_margin_price_adult = Math.round(marginPercentagePriceForAdult);
          admin_margin_price_child = Math.round(marginPercentagePriceForChild);
          admin_margin_price_infant = Math.round(marginPercentagePriceForInfant);
        }
      } else {
        const percentage = 10 / 100;
        const marginPercentagePriceForAdult = price_per_person_adult * percentage;
        const marginPercentagePriceForChild = price_per_person_child * percentage;
        const marginPercentagePriceForInfant = price_per_person_infant * percentage;

        admin_margin_percentage = 10;
        admin_margin_price_adult = Math.round(marginPercentagePriceForAdult);
        admin_margin_price_child = Math.round(marginPercentagePriceForChild);
        admin_margin_price_infant = Math.round(marginPercentagePriceForInfant);
      }
    } else if (hotel_id || room_id) {
      const packageMargin = await package_profit_margin.findOne({ state_name: state }); // Use optional chaining in case destinationData is null

      if (packageMargin && packageMargin.month_and_margin_user) {
        const marginObj = packageMargin.month_and_margin_user.find((margin) => margin.month_name === currentMonth);

        if (marginObj) {
          const percentage = marginObj.margin_percentage / 100;
          const marginPercentagePriceForAdult = price_per_person_adult * percentage;
          const marginPercentagePriceForExtraBad = extra_bad * percentage;

          admin_margin_percentage = marginObj.margin_percentage;
          admin_margin_price_adult = Math.round(marginPercentagePriceForAdult);
          admin_margin_extra_bad = Math.round(marginPercentagePriceForExtraBad);
        } else {
          // If margin for current month is not found, set admin margin to 0
          const percentage = 10 / 100;
          const marginPercentagePriceForAdult = price_per_person_adult * percentage;
          const marginPercentagePriceForExtraBad = extra_bad * percentage;

          admin_margin_percentage = 10;
          admin_margin_price_adult = Math.round(marginPercentagePriceForAdult);
          admin_margin_extra_bad = Math.round(marginPercentagePriceForExtraBad);
        }
      } else {
        // If no packageMargin found, set admin margin to 0
        const percentage = 10 / 100;
        const marginPercentagePriceForAdult = price_per_person_adult * percentage;
        const marginPercentagePriceForExtraBad = extra_bad * percentage;

        admin_margin_percentage = 10;
        admin_margin_price_adult = Math.round(marginPercentagePriceForAdult);
        admin_margin_extra_bad = Math.round(marginPercentagePriceForExtraBad);
      }
    }

    let payment_type = null;

    if (payment_type_on_booking === "Full Payment") {
      payment_type = "Paid"; // Full payment -> Paid
    } else if (payment_type_on_booking === "Partial Payment") {
      payment_type = "Pending"; // Partial Payment -> Pending
    }

    // let status = null;

    // if (payment_type_on_booking === "Full Payment") {
    //     status = "pending";
    // } else if (payment_type_on_booking === "Partial Payment") {
    //     status = "Pending";
    // }

    // Payload for payment initiation
    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: MERCHANT_USER_ID,
      amount: amount * 100, // paisa
      redirectUrl: `https://syt-web-new-dhruv.onrender.com/booking/${merchantTransactionId}`,
      // redirectUrl: `http://localhost:3000/booking-done/${merchantTransactionId}`,
      redirectMode: "REDIRECT",
      mobileNumber: contact_number,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
    const base64Payload = bufferObj.toString("base64");

    const xVerify = sha256(base64Payload + PAY_URI + SALT_KEY) + "###" + SALT_KEY_INDEX;

    const options = {
      method: "post",
      url: `${HOST_URI}${PAY_URI}`,
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": xVerify
      },
      data: {
        request: base64Payload
      }
    };

    // Create pending transaction entry
    const paymentData = await TransactonSchema.create({
      user_id: MERCHANT_USER_ID,
      custom_requirement_id,
      package_id,
      trnsaction_id: merchantTransactionId,
      status: "pending",
      amount,
      room_id,
      hotel_id,
      vendor_car_id
    });

    try {
      const response = await axios.request(options);
      let bookingData;

      if (response.data && response.data.success) {
        // Create booking only if payment is successful
        if (bid_package_id || custom_requirement_id) {
          bookingData = await bookpackageschema.create({
            user_registration_id: MERCHANT_USER_ID,
            bookdate: getISTTime(),
            bid_package_id,
            custom_requirement_id,
            payment_type,
            title,
            package_type,
            payment_type_on_booking,
            package_id,
            total_adult,
            total_child,
            total_infant,
            contact_number,
            email_id,
            agency_contect_no,
            total_person,
            approx_start_date,
            totaldays,
            totalnight,
            meal,
            meal_type,
            siteseeing,
            transport_mode,
            other_services_by_agency,
            hoteltype,
            priceperperson,
            category,
            booked_include,
            booked_exclude,
            personal_care,
            othere_requirement,
            departure,
            approx_end_date,
            user_name,
            booked_itinerary,
            state,
            city,
            price_per_person_child,
            price_per_person_adult,
            price_per_person_infant,
            room_sharing,
            total_amount,
            travel_details,
            gst_address,
            destination_arrival_date,
            payment: [
              {
                // Add payment details
                paid_amount: paid_amount,
                payment_date: getISTTime(),
                transaction_id: "",
                payment_mode: "UPI",
                payment_status: "success"
              }
            ],
            destination,
            admin_margin_percentage,
            admin_margin_price_adult,
            admin_margin_price_child,
            admin_margin_price_infant,
            status: "pending",
            breakfast_price,
            lunch_price,
            dinner_price,
            hotel_itinerary_array,
            extra_food_array,
            gst_price
          });
        } else if (package_id) {
          bookingData = await bookpackageschema.create({
            user_registration_id: MERCHANT_USER_ID,
            bookdate: getISTTime(),
            bid_package_id,
            custom_requirement_id,
            payment_type,
            title,
            package_type,
            payment_type_on_booking,
            package_id,
            total_adult,
            total_child,
            total_infant,
            contact_number,
            email_id,
            agency_contect_no,
            total_person,
            approx_start_date,
            totaldays,
            totalnight,
            meal,
            meal_type,
            siteseeing,
            transport_mode,
            other_services_by_agency,
            hoteltype,
            priceperperson,
            category,
            booked_include,
            booked_exclude,
            personal_care,
            othere_requirement,
            departure,
            approx_end_date,
            user_name,
            booked_itinerary,
            state,
            city,
            // price_per_person_child: Math.round(price_per_person_child + admin_margin_price_child),
            // price_per_person_adult: Math.round(price_per_person_adult + admin_margin_price_adult),
            // price_per_person_infant: Math.round(price_per_person_infant + admin_margin_price_infant),
            price_per_person_child,
            price_per_person_adult,
            price_per_person_infant,
            room_sharing,
            total_amount,
            travel_details,
            gst_address,
            destination_arrival_date,
            payment: [
              {
                // Add payment details
                paid_amount: paid_amount,
                payment_date: getISTTime(),
                transaction_id: "",
                payment_mode: "UPI",
                payment_status: "success"
              }
            ],
            destination,
            admin_margin_percentage,
            admin_margin_price_adult,
            admin_margin_price_child,
            admin_margin_price_infant,
            status: "pending",
            // breakfast_price,
            // lunch_price,
            // dinner_price,
            hotel_itinerary_array,
            extra_food_array,
            gst_price
          });
        } else if (hotel_id || room_id) {
          bookingData = await hotel_booking_syt_Schema.create({
            hotel_id,
            room_id,
            total_booked_rooms,
            user_id,
            transaction_id: "",
            check_in_date,
            check_out_date,
            total_adult,
            total_child,
            payment_type,
            status: "pending",
            room_title,
            price: paid_amount,
            user_name,
            gender,
            country,
            state,
            city,
            dob,
            contact_no,
            price_per_person_adult,
            extra_bad,
            admin_margin_percentage,
            admin_margin_price_adult,
            admin_margin_extra_bad,
            travel_details,
            breakfast_price,
            lunch_price,
            dinner_price,
            breakfast,
            lunch,
            dinner,
            gst_price
          });
        } else if (vendor_car_id) {
          bookingData = await car_booking_syt.create({
            vendor_car_id,
            transaction_id: "",
            user_id: MERCHANT_USER_ID,
            pickup_address,
            drop_address,
            amount,
            total_days,
            one_way_two_way,
            pickup_date,
            pickup_time,
            name,
            email,
            mobile_number,
            gender,
            return_date,
            status: "pending",
            car_condition,
            model_year,
            insurance,
            registration_number,
            color,
            price_type,
            price_per_km,
            price_per_day,
            pincode,
            city,
            state,
            outStateAllowed,
            AC,
            return_time,
            drop_state,
            drop_city,
            pickup_state,
            pickup_city,
            payment
          });
        }

        res.status(200).json({
          success: true,
          message: "Payment initiated",
          data: {
            url: response.data.data.instrumentResponse.redirectInfo.url,
            merchantTransactionId: merchantTransactionId,
            booking_id: bookingData._id,
            payment_id: bookingData && bookingData.payment ? bookingData.payment[0]._id : "",
            custom_requirement_id: custom_requirement_id || "",
            bid_package_id: bid_package_id || ""
          }
        });
      } else {
        // Handle unsuccessful payment
        await TransactonSchema.findOneAndUpdate({ _id: paymentData._id }, { $set: { status: "failed" } });
        res.status(400).json({
          success: false,
          message: "Payment failed"
        });
      }
    } catch (error) {
      console.log(error);
      await TransactonSchema.findOneAndUpdate({ _id: paymentData._id }, { $set: { status: "failed" } });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const tokenData = req.userData;
    const transaction_id = uniqid();
    const { id } = req.params;
    const { amount, paid_amount, link } = req.body;

    // Check if the token data is valid
    if (!tokenData || tokenData === "") {
      return res.status(401).json({
        message: "Authentication failed"
      });
    }

    // Check if the user has a customer role
    const userData = await userschema.findById(tokenData.id);
    if (!userData || userData.role !== "customer") {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to perform this action"
      });
    }

    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: transaction_id,
      merchantUserId: tokenData.id,
      amount: amount * 100, // paisa
      redirectUrl: `https://syt-web-new-dhruv.onrender.com${link}/${transaction_id}`,
      redirectMode: "REDIRECT",
      // mobileNumber: mobileNumber,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
    const base64Payload = bufferObj.toString("base64");

    const xVerify = sha256(base64Payload + PAY_URI + SALT_KEY) + "###" + SALT_KEY_INDEX;

    const options = {
      method: "post",
      url: `${HOST_URI}${PAY_URI}`,
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": xVerify
      },
      data: {
        request: base64Payload
      }
    };

    // Create pending transaction entry
    const paymentData = await TransactonSchema.create({
      user_id: tokenData.id,
      trnsaction_id: transaction_id,
      status: "pending",
      amount: amount
    });

    const newPayment = {
      paid_amount: paid_amount,
      payment_date: getISTTime(),
      payment_mode: "UPI",
      transaction_id: "",
      payment_status: "success"
    };

    try {
      const response = await axios.request(options);

      const booking = await bookpackageschema.findById(id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found"
        });
      }

      const totalPaid = booking.payment.reduce((total, payment) => total + payment.paid_amount, 0) + paid_amount;

      console.log("totalPaid ::", totalPaid);

      // Determine payment status
      let paymentStatus = totalPaid === booking.total_amount ? "paid" : "pending";

      const updateResult = await bookpackageschema.findByIdAndUpdate(
        id,
        {
          $push: { payment: newPayment },
          $set: { payment_type: paymentStatus }
        },
        { new: true }
      );

      console.log(updateResult);
      const latestPayment = updateResult.payment[updateResult.payment.length - 1];

      res.status(200).json({
        success: true,
        message: "Payment initiated",
        data: {
          url: response.data.data.instrumentResponse.redirectInfo.url,
          merchantTransactionId: transaction_id,
          booking_id: id,
          payment_id: latestPayment._id
        }
      });
    } catch (error) {
      await TransactonSchema.findOneAndUpdate({ _id: paymentData._id }, { $set: { status: "failed" } });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// exports.updatePayment = async (req, res) => {
//     try {
//         const tokenData = req.userData;
//         // const transaction_id = uniqid();
//         const { id } = req.params;
//         const { paid_amount, transaction_id } = req.body;

//         // Check if the token data is valid
//         if (!tokenData || tokenData === "") {
//             return res.status(401).json({
//                 message: "Authentication failed"
//             });
//         }

//         // Check if the user has a customer role
//         const userData = await userschema.findById(tokenData.id);
//         if (!userData || userData.role !== "customer") {
//             return res.status(403).json({
//                 message: "Forbidden: You are not authorized to perform this action"
//             });
//         }

//         const newPayment = {
//             paid_amount: paid_amount,
//             payment_date: getISTTime(),
//             payment_mode: "UPI",
//             transaction_id: transaction_id,
//             payment_status: "success"
//         };

//         const booking = await bookpackageschema.findById(id);

//         if (!booking) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Booking not found"
//             });
//         }

//         const totalPaid = booking.payment.reduce((total, payment) => total + payment.paid_amount, 0) + paid_amount;

//         console.log("totalPaid ::", totalPaid)

//         // Determine payment status
//         let paymentStatus = (totalPaid === booking.total_amount) ? "paid" : "pending";

//         let bookingStatus = (totalPaid === booking.total_amount) ? "booked" : "pending";

//         const updateResult = await bookpackageschema.findByIdAndUpdate(
//             id,
//             {
//                 $push: { payment: newPayment },
//                 $set: { payment_type: paymentStatus, status: bookingStatus }
//             },
//             { new: true }
//         );

//         return res.status(200).json({
//             success: true,
//             message: "Payment update succussfully",
//             data: updateResult
//         })

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

exports.updateBookingData = async (req, res) => {
  try {
    const tokenData = req.userData;
    const { id } = req.params;
    const { status, transaction_id, payment_id, custom_requirement_id, bid_package_id } = req.body; // Expect payment_id to target specific payment entry

    // Check if the token data is valid
    if (!tokenData || tokenData === "") {
      return res.status(401).json({
        message: "Authentication failed"
      });
    }

    // Check if the user has a customer role
    const userData = await userschema.findById(tokenData.id);
    if (!userData || userData.role !== "customer") {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to perform this action"
      });
    }

    // Check if booking exists
    const booking = await bookpackageschema.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Update the specific transaction_id in the payment array using payment_id
    const updateResult = await bookpackageschema.findOneAndUpdate(
      { "_id": id, "payment._id": payment_id }, // Find the booking and target payment by _id
      {
        $set: {
          "payment.$.transaction_id": transaction_id, // Update transaction_id for the specific payment
          "status": status // Also update status
        }
      },
      { new: true }
    );

    if (custom_requirement_id) {
      const bids = await Bidschema.find({ custom_requirement_id: custom_requirement_id });

      // Update the status of the bids based on whether they match the bid_package_id
      for (let bid of bids) {
        if (bid._id.toString() == bid_package_id) {
          // Set status to "booked" for the matched bid
          await Bidschema.findByIdAndUpdate(bid._id, { bid_status: "booked" });

          let bidInfo = await Bidschema.findOne({ _id: bid_package_id });
          let agencyInfo = await agencySchema.findOne({ user_id: bidInfo.agency_id });

          let notificationData = await Notificationschema.create({
            user_id: bids.agency_id,
            title: "New Bid Package Booking!",
            text: `Hello ${agencyInfo.full_name}, a customer has booked your Bid package to ${booking.destination}. Please review the booking details.`,
            user_type: "agency"
          });

          const adminSocketId = getReceiverSocketId(bidInfo.agency_id);
          if (adminSocketId) {
            io.to(adminSocketId).emit("newNotification", notificationData);
          }
        } else {
          // Set status to "rejected" for all other bids
          await Bidschema.findByIdAndUpdate(bid._id, { bid_status: "booked another package" });
        }
      }

      // Update custom requirement status
      await CustomRequirementSchema.findByIdAndUpdate(custom_requirement_id, {
        status: "booked"
      });
    } else if (booking.package_id) {
      let packageInfo = await packageSchema.findOne({ _id: booking.package_id });

      let agencyInfo = await agencySchema.findOne({ user_id: packageInfo.user_id });

      if (agencyInfo) {
        let notificationData = await Notificationschema.create({
          user_id: agencyInfo.user_id,
          title: "New Package Booking!",
          text: `Hello ${agencyInfo.full_name}, a customer has booked your package to ${booking.destination}. Please review the booking details.`,
          user_type: "agency"
        });

        const adminSocketId = getReceiverSocketId(agencyInfo.user_id);
        if (adminSocketId) {
          io.to(adminSocketId).emit("newNotification", notificationData);
        }
      } else {
        let notificationData = await Notificationschema.create({
          user_id: packageInfo.user_id,
          title: "New Package Booking!",
          text: `Hello Admin, a customer has booked your package to ${booking.destination}. Please review the booking details.`,
          user_type: "admin"
        });

        const adminSocketId = getReceiverSocketId(packageInfo.user_id);
        if (adminSocketId) {
          io.to(adminSocketId).emit("newNotification", notificationData);
        }
      }
    }

    let notificationForUser = await Notificationschema.create({
      user_id: tokenData.id,
      title: "Booking Confirmed!",
      text: `Congratulations! Your booking for the package to ${booking.destination} has been confirmed. Your travel is scheduled from ${booking.approx_start_date} to ${booking.approx_end_date}. Stay tuned for more updates!`,
      user_type: "customer"
    });

    const adminSocketId = getReceiverSocketId(tokenData.id);
    if (adminSocketId) {
      io.to(adminSocketId).emit("newNotification", notificationForUser);
    }

    if (!updateResult) {
      return res.status(404).json({
        success: false,
        message: "Payment not found or payment_id mismatch"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: updateResult
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateHotelBooking = async (req, res) => {
  try {
    const tokenData = req.userData;
    const { id } = req.params;
    const { status, transaction_id } = req.body;

    if (!tokenData || tokenData === "") {
      return res.status(401).json({
        message: "Authentication failed"
      });
    }

    // Check if the user has a customer role
    const userData = await userschema.findById(tokenData.id);
    if (!userData || userData.role !== "customer") {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to perform this action"
      });
    }

    // Check if booking exists
    const booking = await hotel_booking_syt_Schema.findById(id);

    let updateData = await hotel_booking_syt_Schema.findByIdAndUpdate(
      id,
      { status: status, transaction_id: transaction_id },
      { new: true }
    );

    let hotelinfo = await hotel_model.findOne({ _id: booking.hotel_id });

    const userNotificationText = `Your hotel booking for ${hotelinfo.hotel_name} has been updated. Your booking status is now: ${status}.`;

    let notificationData = await Notificationschema.create({
      user_id: booking.user_id, // The user who booked the hotel
      title: "Hotel Booking Updated",
      text: userNotificationText,
      user_type: "customer"
    });

    const adminSocketId = getReceiverSocketId(tokenData.id);
    if (adminSocketId) {
      io.to(adminSocketId).emit("newNotification", notificationData);
    }

    let agencyInfo = await agencySchema.findOne({ user_id: hotelinfo.user_id });

    if (agencyInfo) {
      const agencyNotificationText = `A customer has updated their hotel booking for ${hotelinfo.hotel_name}. Please review the updated status.`;
      let notificationForAgency = await Notificationschema.create({
        user_id: hotelinfo.user_id,
        title: "Hotel Booking Update",
        text: agencyNotificationText,
        user_type: "agency"
      });

      const adminSocketId = getReceiverSocketId(hotelinfo.user_id);
      if (adminSocketId) {
        io.to(adminSocketId).emit("newNotification", notificationForAgency);
      }
    } else {
      const adminNotificationText = `A hotel booking for ${hotelinfo.hotel_name} has been updated by a customer. Please review the updated status.`;
      let notificationForAdmin = await Notificationschema.create({
        user_id: hotelinfo.user_id,
        title: "Hotel Booking Update",
        text: adminNotificationText,
        user_type: "admin"
      });

      const adminSocketId = getReceiverSocketId(hotelinfo.user_id);
      if (adminSocketId) {
        io.to(adminSocketId).emit("newNotification", notificationForAdmin);
      }
    }

    return res.status(200).json({
      success: true,
      message: "data update successfully",
      data: updateData
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateCarBooking = async (req, res) => {
  try {
    const tokenData = req.userData;
    const { id } = req.params;
    const { status, transaction_id } = req.body;

    if (!tokenData || tokenData === "") {
      return res.status(401).json({
        message: "Authentication failed"
      });
    }

    const userData = await userschema.findById(tokenData.id);
    if (!userData || userData.role !== "customer") {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to perform this action"
      });
    }

    // Get car booking details
    const carBooking = await car_booking_syt.findById(id);
    if (!carBooking) {
      return res.status(404).json({
        success: false,
        message: "Car booking not found"
      });
    }

    // Update car booking status
    const updateData = await car_booking_syt.findByIdAndUpdate(id, { status, transaction_id }, { new: true });

    // Send notification to user
    let userNotification = await Notificationschema.create({
      user_id: tokenData.id,
      title: "Car Booking Confirmed!",
      text: `Your car booking from ${carBooking.pickup_address} to ${carBooking.drop_address} has been confirmed. Your pickup is scheduled for ${carBooking.pickup_date} at ${carBooking.pickup_time}.`,
      user_type: "customer"
    });

    const userSocketId = getReceiverSocketId(tokenData.id);
    if (userSocketId) {
      io.to(userSocketId).emit("newNotification", userNotification);
    }

    // Get vendor details and send notification
    const vendorInfo = await agencySchema.findOne({ user_id: carBooking.vendor_car_id });

    if (vendorInfo) {
      // Send notification to vendor
      let vendorNotification = await Notificationschema.create({
        user_id: carBooking.vendor_car_id,
        title: "New Car Booking!",
        text: `Hello ${vendorInfo.full_name}, a customer has booked your car service from ${carBooking.pickup_address} to ${carBooking.drop_address}. Pickup scheduled for ${carBooking.pickup_date} at ${carBooking.pickup_time}.`,
        user_type: "agency"
      });

      const vendorSocketId = getReceiverSocketId(carBooking.vendor_car_id);
      if (vendorSocketId) {
        io.to(vendorSocketId).emit("newNotification", vendorNotification);
      }
    } else {
      // Send notification to admin if no vendor found
      let adminNotification = await Notificationschema.create({
        user_id: carBooking.vendor_car_id,
        title: "New Car Booking!",
        text: `A customer has booked a car service from ${carBooking.pickup_address} to ${carBooking.drop_address}. Pickup scheduled for ${carBooking.pickup_date} at ${carBooking.pickup_time}.`,
        user_type: "admin"
      });

      const adminSocketId = getReceiverSocketId(carBooking.vendor_car_id);
      if (adminSocketId) {
        io.to(adminSocketId).emit("newNotification", adminNotification);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Car booking updated successfully",
      data: updateData
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { merchantTransactionId } = req.query;

    const xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) + "###" + SALT_KEY_INDEX;

    const options = {
      method: "get",
      url: `${HOST_URI}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "X-MERCHANT-ID": MERCHANT_ID,
        "X-VERIFY": xVerify
      }
    };

    try {
      const response = await axios.request(options);

      if (response.data.success) {
        const updateResult = await TransactonSchema.findOneAndUpdate(
          { trnsaction_id: merchantTransactionId.toString() },
          { $set: { status: "success" } },
          { new: true } // Return the updated document
        );
      } else {
        const updateResult = await TransactonSchema.findOneAndUpdate(
          { trnsaction_id: merchantTransactionId.toString() },
          { $set: { status: "failed" } },
          { new: true } // Return the updated document
        );
      }

      return res.send(response.data);
    } catch (error) {
      const updateResult = await TransactonSchema.findOneAndUpdate(
        { trnsaction_id: merchantTransactionId.toString() },
        { $set: { status: "failed" } },
        { new: true } // Return the updated document
      );
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
