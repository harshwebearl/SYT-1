const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const bookpackageschema = require("../models/bookpackageschema");
const niv = require("node-input-validator");
const NotFound = require("../errors/NotFound");
const mongoose = require("mongoose");
const agencySchema = require("../models/Agency_personalSchema");
const UserSchema = require("../models/customerSchema");
const sendNotification = require("../config/firebase/firebaseAdmin");
const Bidschema = require("../models/bidSchema");
const userSchema = require("../models/usersSchema");
const destinationCategorySchema = require("../models/DestinationCategorySchema");
const image_url = require("../update_url_path.js");
const CustomRequirementSchema = require("../models/custom_requirementsSchema.js");
const { pipeline } = require("nodemailer/lib/xoauth2/index.js");
const fn = "itinary";
const packageSchema = require("../models/PackageSchema");
const destinationSchema = require("../models/DestinationSchema");
const sgMail = require("@sendgrid/mail");
const package_profit_margin = require("../models/package_profit_margin.js");
const uniqid = require("uniqid");
const ReviewSchema = require("../models/reviewSchema.js");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const BASE_URL = "https://start-your-tour-api.onrender.com/images/placephoto/";

// Function to get IST time
function getISTTime() {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const now = new Date();
  const istTime = new Date(now.getTime() + istOffset);
  return istTime;
}

module.exports = class Book_Package extends BaseController {
  async bookpackage(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "customer") {
        throw new Forbidden("you are not customer");
      }
      const merchantTransactionId = uniqid();

      const {
        // MERCHANT_USER_ID,
        amount,
        // mobileNumber,
        // link,
        custom_requirement_id,
        package_id,
        room_id,
        hotel_id,
        vendor_car_id,
        // payment_type,
        title,
        bid_package_id,
        transaction_id,
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
        category,
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
        payment_type_on_booking
      } = req.body;

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

      // if (package_id) {
      //   const packageData = await packageSchema.findOne({ _id: package_id })
      //   const destinationData = await destinationSchema.findOne({ _id: packageData.destination })
      //   const packageMargin = await package_profit_margin.findOne({ state_name: destinationData.destination_name });

      //   if (packageMargin && packageMargin.month_and_margin_user) {
      //     const marginObj = packageMargin.month_and_margin_user.find(margin => margin.month_name === currentMonth);
      //     const percentage = marginObj.margin_percentage / 100
      //     const marginPercentagePriceForAdult = price_per_person_adult * percentage
      //     const marginPercentagePriceForChild = price_per_person_child * percentage
      //     const marginPercentagePriceForInfant = price_per_person_infant * percentage
      //     if (marginObj) {
      //       admin_margin_percentage = marginObj.margin_percentage;
      //       admin_margin_price_adult = Math.round(marginPercentagePriceForAdult)
      //       admin_margin_price_child = Math.round(marginPercentagePriceForChild)
      //       admin_margin_price_infant = Math.round(marginPercentagePriceForInfant)
      //     }
      //   }
      // } else if (bid_package_id || custom_requirement_id) {
      //   const packageMargin = await package_profit_margin.findOne({ state_name: destination });

      //   if (packageMargin && packageMargin.month_and_margin_user) {
      //     const marginObj = packageMargin.month_and_margin_user.find(margin => margin.month_name === currentMonth);
      //     const percentage = marginObj.margin_percentage / 100
      //     const marginPercentagePriceForAdult = price_per_person_adult * percentage
      //     const marginPercentagePriceForChild = price_per_person_child * percentage
      //     const marginPercentagePriceForInfant = price_per_person_infant * percentage
      //     if (marginObj) {
      //       admin_margin_percentage = marginObj.margin_percentage;
      //       admin_margin_price_adult = Math.round(marginPercentagePriceForAdult)
      //       admin_margin_price_child = Math.round(marginPercentagePriceForChild)
      //       admin_margin_price_infant = Math.round(marginPercentagePriceForInfant)
      //     }
      //   }
      // }
      if (package_id) {
        const packageData = await packageSchema.findOne({ _id: package_id });
        const destinationData = await destinationSchema.findOne({ _id: packageData.destination });
        const packageMargin = await package_profit_margin.findOne({ state_name: destinationData?.destination_name }); // Use optional chaining in case destinationData is null

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
          } else {
            // If margin for current month is not found, set admin margin to 0
            admin_margin_percentage = 0;
            admin_margin_price_adult = 0;
            admin_margin_price_child = 0;
            admin_margin_price_infant = 0;
          }
        } else {
          // If no packageMargin found, set admin margin to 0
          admin_margin_percentage = 0;
          admin_margin_price_adult = 0;
          admin_margin_price_child = 0;
          admin_margin_price_infant = 0;
        }
      } else if (bid_package_id || custom_requirement_id) {
        const packageMargin = await package_profit_margin.findOne({ state_name: destination });

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
          } else {
            // If margin for current month is not found, set admin margin to 0
            admin_margin_percentage = 0;
            admin_margin_price_adult = 0;
            admin_margin_price_child = 0;
            admin_margin_price_infant = 0;
          }
        } else {
          // If no packageMargin found, set admin margin to 0
          admin_margin_percentage = 0;
          admin_margin_price_adult = 0;
          admin_margin_price_child = 0;
          admin_margin_price_infant = 0;
        }
      }

      let payment_type = null;

      if (payment_type_on_booking === "Full Payment") {
        payment_type = "Paid"; // Full payment -> Paid
      } else if (payment_type_on_booking === "Partial Payment") {
        payment_type = "Pending"; // Partial Payment -> Pending
      }

      let status = null;

      if (payment_type_on_booking === "Full Payment") {
        status = "booked";
      } else if (payment_type_on_booking === "Partial Payment") {
        status = "Pending";
      }

      const insertData = {
        user_registration_id: tokenData.id,
        bookdate: getISTTime(),
        bid_package_id,
        custom_requirement_id,
        room_id,
        hotel_id,
        vendor_car_id,
        payment_type,
        title,
        package_type,
        payment_type_on_booking,
        transaction_id,
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
            paid_amount: amount,
            payment_date: getISTTime(),
            transaction_id: transaction_id,
            payment_mode: "UPI",
            payment_status: "success"
          }
        ],
        destination,
        admin_margin_percentage,
        admin_margin_price_adult,
        admin_margin_price_child,
        admin_margin_price_infant,
        status
      };

      const add_book_package = new bookpackageschema(insertData);
      const Add_book_package = await add_book_package.save();

      await CustomRequirementSchema.findByIdAndUpdate(custom_requirement_id, {
        status: "booked",
        Status_change_by: tokenData.id
      });

      const notification_agency = await bookpackageschema.aggregate([
        {
          $match: {
            bid_package_id: mongoose.Types.ObjectId(insertData.bid_package_id)
          }
        },
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bids"
          }
        },
        {
          $lookup: {
            from: "agencypersonals",
            localField: "bids.agency_id",
            foreignField: "user_id",
            as: "agency"
          }
        },
        {
          $project: {
            _id: 0,
            notificationTokens: 1,
            bids: {
              agency_id: 1,
              notificationTokens: 1
            },
            agency: { email_address: 1 }
          }
        }
      ]);
      //  console.log(notification_agency);

      for (let i = 0; i < notification_agency.length; i++) {
        const element = notification_agency[0].bids[0];
        console.log(element);
        if (
          element?.notificationTokens &&
          element?.notificationTokens?.deviceType &&
          element?.notificationTokens?.deviceToken
        ) {
          sendNotification(
            element?.notificationTokens?.deviceType,
            element?.notificationTokens?.deviceToken,
            {
              notification: {
                title: "Notification",
                body: `Added bookpackage`
              },
              data: {
                title: "Notification",
                body: `Added bookpackage`,
                message: "Message"
              }
            },
            element?.email_address
          );
        }
      }

      if (notification_agency.length > 0) {
        const agency = notification_agency[0].agency[0];
        const email = agency?.email_address;

        console.log("email :", email);

        //   if (email) {
        //     const msg = {
        //       to: email,
        //       from: '57rakesh17@gmail.com', // Replace with your verified sender
        //       subject: 'New Booking Notification',
        //       text: `A new package has been booked. Details:\n\nCustomer: ${req.body.user_name}\nTotal Amount: ${insertData.total_amount}`,
        //       html: `<strong>A new package has been booked.</strong><br><br>Customer: ${req.body.user_name}<br>Total Amount: ${insertData.total_amount}`
        //     };

        //     await sgMail.send(msg)
        //       .then(() => {
        //         console.log("Email Sent Successfully")

        //       }).catch((error) => {
        //         console.log(error)
        //       });
        //   }
      }

      this.sendJSONResponse(
        res,
        "book package is added",
        {
          length: 1
        },
        Add_book_package
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_book_packages(req, res) {
    try {
      const tokenData = req.userData;

      const display_book_packages = await bookpackageschema.aggregate([
        {
          $match: { user_registration_id: mongoose.Types.ObjectId(tokenData.id) }
        },
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bid",
            pipeline: [
              {
                $lookup: {
                  from: "agencypersonals",
                  localField: "agency_id",
                  foreignField: "user_id",
                  as: "agencypersonals"
                }
              }
            ]
          }
        },
        {
          $addFields: {
            agency_id: { $first: { $first: "$bid.agencypersonals.user_id" } },
            agencyname: { $first: { $first: "$bid.agencypersonals.agency_name" } },
            bid_date: { $first: "$bid.bid_date" },
            bid_id: { $first: "$bid._id" },
            agencyprice: { $first: "$bid.price_per_person" },
            destination: { $first: "$bid.destination" },
            price_per_person_child: { $first: "$bid.price_per_person_child" },
            price_per_person_adult: { $first: "$bid.price_per_person_adult" },
            price_per_person_infant: { $first: "$bid.price_per_person_infant" },
            room_sharing: { $first: "$bid.room_sharing" },
            total_amount: { $first: "$bid.total_amount" },
            package_valid_till_for_booking: { $first: "$bid.package_valid_till_for_booking" }
          }
        },
        {
          $project: {
            _id: 1,
            user_registration_id: 1,
            bookdate: 1,
            transaction_id: 1,
            title: 1,
            payment_type: 1,
            // bid_package_id: 1,
            contact_number: 1,
            email_id: 1,
            approx_start_date: 1,
            totaldays: 1,
            totalnight: 1,
            meal: 1,
            meal_type: 1,
            siteseeing: 1,
            gst_price: 1,
            transport_mode: 1,
            transport_include_exclude: 1,
            payment_type_on_booking: 1,
            hoteltype: 1,
            priceperperson: 1,
            total_person: 1,
            package_type: 1,
            agency_contect_no: 1,
            category: 1,
            booked_include: 1,
            booked_exclude: 1,
            othere_requirement: 1,
            custom_package_id: 1,
            departure: 1,
            approx_end_date: 1,
            user_name: 1,
            status: 1,
            status_chenged_by: 1,
            total_adult: 1,
            total_child: 1,
            total_infant: 1,
            personal_care: 1,
            agency_id: 1,
            agencyname: 1,
            bid_date: 1,
            bid_id: 1,
            agencyprice: 1,
            destination: 1,
            booked_itinerary: 1,
            price_per_person_child: 1,
            price_per_person_adult: 1,
            price_per_person_infant: 1,
            package_valid_till_for_booking: 1,
            room_sharing: 1,
            total_amount: 1,
            travel_details: 1,
            gst_address: 1,
            destination_arrival_date: 1,
            payment: 1,
            breakfast_price: 1,
            lunch_price: 1,
            dinner_price: 1,
            hotel_itinerary_array: 1,
            extra_food_array: 1
          }
        }
      ]);
      this.sendJSONResponse(
        res,
        "display book package details",
        {
          length: 1
        },
        display_book_packages
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_book_packages_details(req, res) {
    try {
      const id = req.query._id;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      const display_book_packages_details = await bookpackageschema.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(id) }
        },
        {
          $lookup: {
            from: "itineries",
            localField: "booked_itinerary",
            foreignField: "_id",
            as: "book_package_itinerary"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "user_registration_id",
            foreignField: "_id",
            as: "customer",
            pipeline: [
              {
                $lookup: {
                  from: "customers",
                  localField: "_id",
                  foreignField: "user_id",
                  as: "customer_detail"
                }
              }
            ]
          }
        }
      ]);
      this.sendJSONResponse(
        res,
        "display book package details",
        {
          length: 1
        },
        display_book_packages_details
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_book_package_for_agency(req, res) {
    try {
      // const tokenData = req.userData;
      // const AgencyData = await agencySchema.find({ _id: tokenData.id });
      // if (AgencyData.length === 0) {
      //   throw new NotFound("Agencydata not found");
      // }
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      const display_book_package_for_agency = await Bidschema.aggregate([
        {
          $match: { agency_id: mongoose.Types.ObjectId(tokenData.id) }
        },
        // {
        //   $lookup:{
        //     from: "custom_requirements",
        //     localField: "custom_requirement_id",
        //     foreignField: "_id",
        //     as: "custom_requirement",
        //   }
        // },
        {
          $lookup: {
            from: "book_packages",
            localField: "_id",
            foreignField: "bid_package_id",
            as: "book_package",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  localField: "user_registration_id",
                  foreignField: "_id",
                  as: "users_details"
                }
              }
            ]
          }
        },
        {
          $match: { book_package: { $ne: [] } }
        }
      ]);

      // const result = []

      // for (let  i= 0;  i< display_book_package_for_agency.length; i++) {
      //   // console.log(display_book_package_for_agency);
      //   for (let j = 0; j < display_book_package_for_agency[i].book_package.length; j++) {
      //      console.log(display_book_package_for_agency[i].book_package);
      //       const total_price =  display_book_package_for_agency[i].book_package[j].priceperperson *  display_book_package_for_agency[i].book_package[j].total_person
      //       console.log(total_price);
      //       result.push({
      //         display_book_package_for_agency: total_price,
      //         // total_price: display_book_package_for_agency[i].book_package[j].total_price
      //       });
      //   }
      // }

      display_book_package_for_agency.sort().reverse();

      this.sendJSONResponse(
        res,
        "display book package for agency",
        {
          length: 1
        },
        display_book_package_for_agency
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_book_status(req, res) {
    try {
      const id = req.query._id;
      const tokenData = req.userData;

      const chengedata = {
        status: req.body.status,
        status_chenged_by: req.body.status_chenged_by
      };

      const chenge_book_status = await bookpackageschema.findByIdAndUpdate({ _id: id }, chengedata);
      console.log(chenge_book_status);
      this.sendJSONResponse(
        res,
        "update book package details",
        {
          length: 1
        },
        chenge_book_status
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async display_book_packages_jaydev(req, res) {
  //   try {
  //     const tokenData = req.userData;
  //     const getCategoryNames = async (categoryIds) => {
  //       try {
  //         if (!categoryIds || categoryIds.length === 0) {
  //           return [];
  //         }

  //         // Check if categoryIds is an array
  //         if (Array.isArray(categoryIds)) {
  //           // Join the array elements into a string
  //           categoryIds = categoryIds.join(',');
  //         }

  //         const idArray = categoryIds.split(',');
  //         const validCategoryIds = idArray.map(id => mongoose.Types.ObjectId(id));

  //         const categoryNames = await destinationCategorySchema.find({ _id: { $in: validCategoryIds } }, 'category_name');
  //         return categoryNames.map(category => ({ _id: category._id.toString(), category_name: category.category_name }));
  //       } catch (error) {
  //         throw error;
  //       }
  //     };

  //     const display_book_packages = await bookpackageschema.aggregate([
  //       {
  //         $match: { user_registration_id: mongoose.Types.ObjectId(tokenData.id) }
  //       },
  //       {
  //         $lookup: {
  //           from: "bids",
  //           localField: "bid_package_id",
  //           foreignField: "_id",
  //           as: "bid",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "agencypersonals",
  //                 localField: "agency_id",
  //                 foreignField: "user_id",
  //                 as: "agencypersonals"
  //               },

  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "book_package_itineraries",
  //           localField: "_id",
  //           foreignField: "book_package_id",
  //           as: "book_package_itinerary"
  //         }
  //       },
  //       // {
  //       //   $addFields: {
  //       //     booked_itinerary: "$book_package_itinerary"
  //       //   }
  //       // },
  //       {
  //         $addFields: {
  //           "booked_itinerary": {
  //             $map: {
  //               input: "$booked_itinerary",
  //               as: "itinerary",
  //               in: {
  //                 $mergeObjects: [
  //                   "$$itinerary",
  //                   {
  //                     photo: {
  //                       $concat: [
  //                         image_url, //"/images/itinary/",
  //                         "$$itinerary.photo"
  //                       ]
  //                     }
  //                   }
  //                 ]
  //               }
  //             }
  //           }
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "bids",
  //           localField: "bid_package_id",
  //           foreignField: "_id",
  //           as: "bid",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "agencypersonals",
  //                 localField: "agency_id",
  //                 foreignField: "user_id",
  //                 as: "agencypersonals"
  //               },

  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $addFields: {
  //           agency_id: { $first: { $first: "$bid.agencypersonals.user_id" } },
  //           agencyname: { $first: { $first: "$bid.agencypersonals.full_name" } },
  //           agency_phone_no: { $first: { $first: "$bid.agencypersonals.agency_phone_no" } },
  //           bid_date: { $first: "$bid.bid_date" },
  //           bid_id: { $first: "$bid._id" },
  //           agencyprice: { $first: "$bid.price_per_person" },
  //           destination: { $first: "$bid.destination" },
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "destination_categories",
  //           localField: "category",
  //           foreignField: "_id",
  //           as: "destination_category"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "hotel_booking_syts",
  //           localField: "user_registration_id",
  //           foreignField: "user_id",
  //           as: "hotel_booking_details"
  //         }
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           user_registration_id: 1,
  //           bookdate: 1,
  //           payment_type: 1,
  //           // bid_package_id: 1,
  //           contact_number: 1,
  //           email_id: 1,
  //           approx_start_date: 1,
  //           totaldays: 1,
  //           totalnight: 1,
  //           meal: 1,
  //           meal_type: 1,
  //           siteseeing: 1,
  //           transport_mode: 1,
  //           transport_include_exclude: 1,
  //           hoteltype: 1,
  //           priceperperson: 1,
  //           total_person: 1,
  //           agency_contect_no: 1,
  //           agency_phone_no: 1,
  //           category: 1,
  //           booked_include: 1,
  //           booked_exclude: 1,
  //           othere_requirement: 1,
  //           custom_package_id: 1,
  //           departure: 1,
  //           approx_end_date: 1,
  //           user_name: 1,
  //           status: 1,
  //           status_chenged_by: 1,
  //           total_adult: 1,
  //           total_child: 1,
  //           total_infant: 1,
  //           personal_care: 1,
  //           agency_id: 1,
  //           agencyname: 1,
  //           bid_date: 1,
  //           bid_id: 1,
  //           agencyprice: 1,
  //           destination: 1,
  //           booked_itinerary: 1,
  //           hotel_booking_details: 1
  //         }
  //       }
  //     ]);
  //     for (const item of display_book_packages) {
  //       const categoryIds = Array.isArray(item.category) ? item.category : (typeof item.category === 'string' ? item.category.split(',') : []);
  //       const categoryNames = await getCategoryNames(categoryIds);
  //       const categoryNamesArray = categoryNames.map(cat => cat.category_name);
  //       item.category = categoryNamesArray;
  //     }

  //     for (let i = 0; i < display_book_packages.length; i++) {
  //       const itinerary = display_book_packages[i].booked_itinerary;
  //       if (itinerary && Array.isArray(itinerary)) {
  //         for (let j = 0; j < itinerary.length; j++) {
  //           const currentItinerary = itinerary[j];
  //           if (currentItinerary && currentItinerary.photo) {
  //             currentItinerary.photo = await image_url(fn, currentItinerary.photo);
  //           }
  //         }
  //       }
  //     }

  //     this.sendJSONResponse(
  //       res,
  //       "display book package details",
  //       {
  //         length: 1
  //       },
  //       display_book_packages
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async display_book_packages_jaydev(req, res) {
    try {
      const tokenData = req.userData;

      // Validate tokenData.id as ObjectId
      if (!mongoose.Types.ObjectId.isValid(tokenData.id)) {
        throw new Error("Invalid user ID format");
      }

      const getCategoryNames = async (categoryIds) => {
        try {
          if (!categoryIds || categoryIds.length === 0) {
            return [];
          }

          // Ensure categoryIds is an array
          if (typeof categoryIds === "string") {
            categoryIds = categoryIds.split(",");
          }

          const validCategoryIds = categoryIds
            .filter((id) => mongoose.Types.ObjectId.isValid(id))
            .map((id) => mongoose.Types.ObjectId(id));

          if (validCategoryIds.length === 0) {
            return [];
          }

          const categoryNames = await destinationCategorySchema.find(
            { _id: { $in: validCategoryIds } },
            "category_name"
          );
          return categoryNames.map((category) => ({
            _id: category._id.toString(),
            category_name: category.category_name
          }));
        } catch (error) {
          throw error;
        }
      };

      const baseHotelPhotoURL = "https://start-your-tour-api.onrender.com/images/hotel_itienrary/";

      const display_book_packages = await bookpackageschema.aggregate([
        {
          $match: {
            user_registration_id: mongoose.Types.ObjectId(tokenData.id),
            status: "booked"
          }
        },
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bid",
            pipeline: [
              {
                $lookup: {
                  from: "agencypersonals",
                  localField: "agency_id",
                  foreignField: "user_id",
                  as: "agencypersonals"
                }
              },
              {
                $lookup: {
                  from: "destinations",
                  localField: "destination",
                  foreignField: "destination_name",
                  as: "Destination"
                }
              },
              {
                $unwind: {
                  path: "$Destination",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $lookup: {
                  from: "place_to_visits",
                  localField: "Destination._id",
                  foreignField: "destination_id",
                  as: "Places_to_visit",
                  pipeline: [
                    {
                      $project: {
                        _id: 0, // Exclude the _id field
                        photo: 1 // Include only the photo field
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  // Take the first photo from the Places_to_visit array
                  photo: {
                    $concat: [BASE_URL, { $arrayElemAt: ["$Places_to_visit.photo", 0] }]
                  }
                }
              },
              {
                $project: {
                  Places_to_visit: 0, // Exclude the entire Places_to_visit array
                  Destination: 0 // Exclude the entire Places_to_visit array
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "itineries",
            localField: "booked_itinerary",
            foreignField: "_id",
            as: "book_package_itinerary"
          }
        },
        {
          $lookup: {
            from: "hotel_itienraries",
            localField: "book_package_itinerary.hotel_itienrary_id",
            foreignField: "_id",
            as: "hotel_itienrary"
          }
        },
        {
          $addFields: {
            booked_itinerary: {
              $map: {
                input: "$book_package_itinerary",
                as: "itinerary",
                in: {
                  $mergeObjects: [
                    "$$itinerary",
                    {
                      photo: {
                        $concat: [
                          image_url, // Assuming image_url is a string variable
                          "$$itinerary.photo"
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $addFields: {
            hotel_itienrary: {
              $map: {
                input: "$hotel_itienrary",
                as: "hotel",
                in: {
                  $mergeObjects: [
                    "$$hotel",
                    {
                      days: {
                        $reduce: {
                          input: {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$booked_itinerary",
                                  as: "itinerary",
                                  cond: {
                                    $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"]
                                  }
                                }
                              },
                              as: "itinerary",
                              in: {
                                $toString: "$$itinerary.day"
                              }
                            }
                          },
                          initialValue: "",
                          in: {
                            $cond: {
                              if: { $eq: ["$$value", ""] },
                              then: "$$this",
                              else: { $concat: ["$$value", ",", "$$this"] }
                            }
                          }
                        }
                      },
                      hotel_photo: {
                        $map: {
                          input: "$$hotel.hotel_photo",
                          as: "photo",
                          in: {
                            $concat: [baseHotelPhotoURL, "$$photo"]
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: "destination_categories",
            localField: "category",
            foreignField: "_id",
            as: "destination_category"
          }
        },
        // {
        //   $lookup: {
        //     from: "hotel_booking_syts",
        //     localField: "user_registration_id",
        //     foreignField: "user_id",
        //     as: "hotel_booking_details"
        //   }
        // },
        {
          $lookup: {
            from: "packages",
            localField: "package_id",
            foreignField: "_id",
            as: "package_details",
            pipeline: [
              {
                $lookup: {
                  from: "destinations",
                  localField: "destination",
                  foreignField: "_id",
                  as: "destination"
                }
              },
              {
                $lookup: {
                  from: "agencypersonals",
                  localField: "user_id",
                  foreignField: "user_id",
                  as: "agencypersonals"
                }
              },
              {
                $lookup: {
                  from: "place_to_visits",
                  localField: "place_to_visit_id",
                  foreignField: "_id",
                  as: "place_to_visits_photo",
                  pipeline: [
                    {
                      $project: {
                        _id: 0, // Exclude the _id field
                        photo: 1 // Include only hotel_name field
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  photo: {
                    $concat: [BASE_URL, { $arrayElemAt: ["$place_to_visits_photo.photo", 0] }]
                  }
                }
              },
              {
                $project: {
                  place_to_visits_photo: 0
                }
              }
            ]
          }
        },
        {
          $addFields: {
            agency_id: { $first: { $first: "$bid.agencypersonals.user_id" } },
            agencyname: { $first: { $first: "$bid.agencypersonals.agency_name" } },
            agency_phone_no: { $first: { $first: "$bid.agencypersonals.mobile_number" } },
            bid_date: { $first: "$bid.bid_date" },
            bid_id: { $first: "$bid._id" },
            bid_destination: { $first: "$bid.destination" },
            bid_total_amount: { $first: "$bid.total_amount" },
            package_valid_till_for_booking: { $first: "$bid.package_valid_till_for_booking" },
            place_to_visits_photo_bid: { $first: "$bid.photo" }
          }
        },
        {
          $addFields: {
            package_agency_id: { $first: { $first: "$package_details.agencypersonals.user_id" } },
            package_agencyname: { $first: { $first: "$package_details.agencypersonals.agency_name" } },
            package_agency_phone_no: { $first: { $first: "$package_details.agencypersonals.mobile_number" } },
            package_date: { $first: "$package_details.updatedAt" },
            package_id: { $first: "$package_details._id" },
            package_agencyprice: { $first: "$package_details.price_per_person" },
            package_destination: { $first: { $first: "$package_details.destination.destination_name" } },
            package_total_amount: { $first: "$package_details.total_amount" }
          }
        },
        {
          $addFields: {
            package_agencyname: {
              $cond: {
                if: {
                  $and: [
                    { $not: ["$bid_id"] }, // No bid ID implies it's a package booking
                    { $not: ["$package_agency_id"] } // Check if package agency ID is also null/undefined
                  ]
                },
                then: "SYT TravelTech Pvt Ltd", // Default name for booked packages
                else: {
                  $cond: {
                    if: { $not: ["$bid_id"] }, // If it's a package booking
                    then: "$package_agencyname", // Keep existing name if available
                    else: null // Null for bid package
                  }
                }
              }
            }
          }
        },
        {
          $addFields: {
            book_type: {
              $cond: {
                if: { $ifNull: ["$bid_id", false] }, // If bid_id is present
                then: "bidpackage",
                else: "package"
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            user_registration_id: 1,
            transaction_id: 1,
            bookdate: 1,
            payment_type: 1,
            contact_number: 1,
            email_id: 1,
            approx_start_date: 1,
            title: 1,
            totaldays: 1,
            totalnight: 1,
            meal: 1,
            meal_type: 1,
            siteseeing: 1,
            gst_price: 1,
            transport_mode: 1,
            transport_include_exclude: 1,
            package_type: 1,
            hoteltype: 1,
            payment_type_on_booking: 1,
            priceperperson: 1,
            total_person: 1,
            agency_contect_no: 1,
            agency_phone_no: 1,
            category: 1,
            booked_include: 1,
            booked_exclude: 1,
            othere_requirement: 1,
            custom_package_id: 1,
            departure: 1,
            approx_end_date: 1,
            user_name: 1,
            status: 1,
            status_chenged_by: 1,
            total_adult: 1,
            total_child: 1,
            total_infant: 1,
            personal_care: 1,
            agency_id: 1,
            agencyname: 1,
            bid_date: 1,
            bid_total_amount: 1,
            // bid: 1,
            place_to_visits_photo_bid: 1,
            bid_id: 1,
            agencyprice: 1,
            breakfast_price: 1,
            lunch_price: 1,
            dinner_price: 1,
            destination: 1,
            price_per_person_child: 1,
            price_per_person_adult: 1,
            price_per_person_infant: 1,
            room_sharing: 1,
            total_amount: 1,
            booked_itinerary: 1,
            hotel_booking_details: 1,
            package_id: 1,
            package_date: 1,
            package_agency_id: 1,
            package_agencyname: 1,
            package_agency_phone_no: 1,
            package_agencyprice: 1,
            package_destination: 1,
            booktype: "package",
            // book_package_itinerary: 1,
            hotel_itienrary: 1,
            package_total_amount: 1,
            package_valid_till_for_booking: 1,
            travel_details: 1,
            gst_address: 1,
            destination_arrival_date: 1,
            payment: 1,
            package_details: 1,
            bid_destination: 1,
            city: 1,
            state: 1,
            admin_margin_percentage: 1,
            admin_margin_price_adult: 1,
            admin_margin_price_child: 1,
            admin_margin_price_infant: 1,
            hotel_itinerary_array: 1,
            book_type: 1,
            extra_food_array: 1
          }
        }
      ]);

      const agencyReviewStats = await ReviewSchema.aggregate([
        {
          $lookup: {
            from: "book_packages",
            localField: "book_package_id",
            foreignField: "_id",
            as: "book_package"
          }
        },
        {
          $unwind: "$book_package"
        },
        {
          $lookup: {
            from: "packages",
            localField: "book_package.package_id",
            foreignField: "_id",
            as: "package"
          }
        },
        {
          $unwind: "$package"
        },
        {
          $addFields: {
            agency_id: "$package.user_id",
            star_numeric: { $toInt: "$star" }
          }
        },
        {
          $group: {
            _id: "$agency_id",
            total_reviews: { $sum: 1 },
            total_rating: { $sum: "$star_numeric" },
            rating_count: { $sum: { $cond: [{ $gt: ["$star_numeric", 0] }, 1, 0] } }
          }
        },
        {
          $addFields: {
            avg_rating: {
              $cond: [{ $gt: ["$rating_count", 0] }, { $divide: ["$total_rating", "$rating_count"] }, 0]
            }
          }
        }
      ]);

      const bidAgencyReviewStats = await ReviewSchema.aggregate([
        {
          $lookup: {
            from: "book_packages",
            localField: "book_package_id",
            foreignField: "_id",
            as: "book_package"
          }
        },
        { $unwind: "$book_package" },
        {
          $lookup: {
            from: "bids",
            localField: "book_package.bid_package_id",
            foreignField: "_id",
            as: "bid"
          }
        },
        { $unwind: "$bid" },
        {
          $addFields: {
            agency_id: "$bid.agency_id",
            star_numeric: { $toInt: "$star" }
          }
        },
        {
          $group: {
            _id: "$agency_id",
            total_reviews: { $sum: 1 },
            total_rating: { $sum: "$star_numeric" },
            rating_count: {
              $sum: {
                $cond: [{ $gt: ["$star_numeric", 0] }, 1, 0]
              }
            }
          }
        },
        {
          $addFields: {
            avg_rating: {
              $cond: [{ $gt: ["$rating_count", 0] }, { $divide: ["$total_rating", "$rating_count"] }, 0]
            }
          }
        }
      ]);

      const adminReviewStats = await ReviewSchema.aggregate([
        {
          $lookup: {
            from: "book_packages",
            localField: "book_package_id",
            foreignField: "_id",
            as: "book_package"
          }
        },
        {
          $unwind: "$book_package"
        },
        {
          $lookup: {
            from: "packages",
            localField: "book_package.package_id",
            foreignField: "_id",
            as: "package"
          }
        },
        {
          $unwind: "$package"
        },
        {
          $addFields: {
            agency_id: "$package.user_id",
            star_numeric: { $toInt: "$star" }
          }
        },
        {
          $group: {
            _id: "$agency_id",
            total_reviews: { $sum: 1 },
            total_rating: { $sum: "$star_numeric" },
            rating_count: { $sum: { $cond: [{ $gt: ["$star_numeric", 0] }, 1, 0] } }
          }
        },
        {
          $addFields: {
            avg_rating: {
              $cond: [{ $gt: ["$rating_count", 0] }, { $divide: ["$total_rating", "$rating_count"] }, 0]
            }
          }
        }
      ]);

      console.log("adminReviewStats", adminReviewStats);

      const combinedReviewStats = [...agencyReviewStats, ...bidAgencyReviewStats];

      const agencyReviewMap = {};
      for (const item of combinedReviewStats) {
        const agencyId = item._id.toString();
        if (!agencyReviewMap[agencyId]) {
          agencyReviewMap[agencyId] = {
            total_reviews: 0,
            total_rating: 0,
            rating_count: 0
          };
        }
        agencyReviewMap[agencyId].total_reviews += item.total_reviews;
        agencyReviewMap[agencyId].total_rating += item.total_rating;
        agencyReviewMap[agencyId].rating_count += item.rating_count;
      }

      // Calculate avg_rating
      for (const agencyId in agencyReviewMap) {
        const data = agencyReviewMap[agencyId];
        data.avg_rating = data.rating_count ? parseFloat((data.total_rating / data.rating_count).toFixed(1)) : 0;
      }

      const ADMIN_ID = "66605bcdcf3cced653094023"; // Your admin user ID
      const adminReviewData = adminReviewStats.find((stat) => stat._id.toString() === ADMIN_ID);

      for (const item of display_book_packages) {
        const agencyId =
          item.book_type === "bidpackage" ? item.agency_id?.toString() : item.package_agency_id?.toString();

        // If agencyId exists, use normal agency stats
        if (agencyId && agencyReviewMap[agencyId]) {
          const reviewData = agencyReviewMap[agencyId];
          item.agency_total_reviews = reviewData.total_reviews;
          item.agency_avg_rating = reviewData.avg_rating;
        }

        // If agencyId is missing or the ID matches the admin
        else if (!agencyId || agencyId === ADMIN_ID) {
          item.agency_total_reviews = adminReviewData ? adminReviewData.total_reviews : 0;
          item.agency_avg_rating = adminReviewData ? adminReviewData.avg_rating : 0;
        }

        // Fallback if no data
        else {
          item.agency_total_reviews = 0;
          item.agency_avg_rating = 0;
        }
      }

      // Process categories
      for (const item of display_book_packages) {
        const categoryIds = Array.isArray(item.category)
          ? item.category
          : typeof item.category === "string"
            ? item.category.split(",")
            : [];
        const categoryNames = await getCategoryNames(categoryIds);
        const categoryNamesArray = categoryNames.map((cat) => cat.category_name);
        item.category = categoryNamesArray;
      }

      // Process itinerary photos
      for (let i = 0; i < display_book_packages.length; i++) {
        const itinerary = display_book_packages[i].booked_itinerary;
        if (itinerary && Array.isArray(itinerary)) {
          for (let j = 0; j < itinerary.length; j++) {
            const currentItinerary = itinerary[j];
            if (currentItinerary && currentItinerary.photo) {
              currentItinerary.photo = await image_url(fn, currentItinerary.photo); // Assuming image_url is a function
            }
          }
        }
      }

      this.sendJSONResponse(
        res,
        "display book package details",
        { length: display_book_packages.length },
        display_book_packages
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_book_packages_by_admin(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const getCategoryNames = async (categoryIds) => {
        try {
          if (!categoryIds || categoryIds.length === 0) {
            return [];
          }

          // Check if categoryIds is an array
          if (Array.isArray(categoryIds)) {
            // Join the array elements into a string
            categoryIds = categoryIds.join(",");
          }

          const idArray = categoryIds.split(",");
          const validCategoryIds = idArray.map((id) => mongoose.Types.ObjectId(id));

          const categoryNames = await destinationCategorySchema.find(
            { _id: { $in: validCategoryIds } },
            "category_name"
          );
          return categoryNames.map((category) => ({
            _id: category._id.toString(),
            category_name: category.category_name
          }));
        } catch (error) {
          throw error;
        }
      };

      let { user_id } = req.query;

      const display_book_packages = await bookpackageschema.aggregate([
        {
          $match: { user_registration_id: mongoose.Types.ObjectId(user_id) }
        },
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bid",
            pipeline: [
              {
                $lookup: {
                  from: "agencypersonals",
                  localField: "agency_id",
                  foreignField: "user_id",
                  as: "agencypersonals"
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "itineries",
            localField: "booked_itinerary",
            foreignField: "_id",
            as: "book_package_itinerary"
          }
        },
        {
          $addFields: {
            booked_itinerary: {
              $map: {
                input: "$book_package_itinerary",
                as: "itinerary",
                in: {
                  $mergeObjects: [
                    "$$itinerary",
                    {
                      photo: {
                        $concat: [
                          image_url, // Assuming image_url is a string variable
                          "$$itinerary.photo"
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: "destination_categories",
            localField: "category",
            foreignField: "_id",
            as: "destination_category"
          }
        },
        {
          $lookup: {
            from: "hotel_booking_syts",
            localField: "user_registration_id",
            foreignField: "user_id",
            as: "hotel_booking_details"
          }
        },
        {
          $lookup: {
            from: "packages",
            localField: "package_id",
            foreignField: "_id",
            as: "package_details",
            pipeline: [
              {
                $lookup: {
                  from: "destinations",
                  localField: "destination",
                  foreignField: "_id",
                  as: "destination"
                }
              },
              {
                $lookup: {
                  from: "agencypersonals",
                  localField: "user_id",
                  foreignField: "user_id",
                  as: "agencypersonals"
                }
              }
            ]
          }
        },
        {
          $addFields: {
            agency_id: { $first: { $first: "$bid.agencypersonals.user_id" } },
            agencyname: { $first: { $first: "$bid.agencypersonals.agency_name" } },
            agency_phone_no: { $first: { $first: "$bid.agencypersonals.mobile_number" } },
            bid_date: { $first: "$bid.bid_date" },
            bid_id: { $first: "$bid._id" },
            // agencyprice: { $first: "$bid.price_per_person" },
            // destination: { $first: "$bid.destination" },
            total_amount: { $first: "$bid.total_amount" },
            package_valid_till_for_booking: { $first: "$bid.package_valid_till_for_booking" }
          }
        },
        {
          $addFields: {
            package_agency_id: { $first: { $first: "$package_details.agencypersonals.user_id" } },
            package_agencyname: { $first: { $first: "$package_details.agencypersonals.agency_name" } },
            package_agency_phone_no: { $first: { $first: "$package_details.agencypersonals.mobile_number" } },
            package_date: { $first: "$package_details.updatedAt" },
            package_id: { $first: "$package_details._id" },
            package_agencyprice: { $first: "$package_details.price_per_person" },
            package_destination: { $first: { $first: "$package_details.destination.destination_name" } },
            package_total_amount: { $first: "$package_details.total_amount" },
            package_type: { $first: "$package_details.package_type" }

            // package_valid_till_for_booking: { $first: "$package_details.package_valid_till_for_booking" }
          }
        },
        {
          $project: {
            _id: 1,
            user_registration_id: 1,
            bookdate: 1,
            payment_type: 1,
            contact_number: 1,
            transaction_id: 1,
            title: 1,
            email_id: 1,
            approx_start_date: 1,
            totaldays: 1,
            totalnight: 1,
            meal: 1,
            meal_type: 1,
            siteseeing: 1,
            package_type: 1,
            transport_mode: 1,
            transport_include_exclude: 1,
            payment_type_on_booking: 1,
            hoteltype: 1,
            priceperperson: 1,
            total_person: 1,
            gst_price: 1,
            agency_contect_no: 1,
            agency_phone_no: 1,
            category: 1,
            booked_include: 1,
            booked_exclude: 1,
            othere_requirement: 1,
            custom_package_id: 1,
            departure: 1,
            approx_end_date: 1,
            user_name: 1,
            status: 1,
            status_chenged_by: 1,
            total_adult: 1,
            total_child: 1,
            total_infant: 1,
            personal_care: 1,
            breakfast_price: 1,
            lunch_price: 1,
            dinner_price: 1,
            agency_id: 1,
            price_per_person_child: 1,
            price_per_person_adult: 1,
            price_per_person_infant: 1,
            room_sharing: 1,
            total_amount: 1,
            agencyname: 1,
            bid_date: 1,
            bid_id: 1,
            agencyprice: 1,
            destination: 1,
            booked_itinerary: 1,
            hotel_booking_details: 1,
            package_id: 1,
            package_date: 1,
            package_agency_id: 1,
            package_agencyname: 1,
            package_agency_phone_no: 1,
            package_agencyprice: 1,
            package_destination: 1,
            package_total_amount: 1,
            package_valid_till_for_booking: 1,
            travel_details: 1,
            gst_address: 1,
            destination_arrival_date: 1,
            payment: 1,
            package_type: 1,
            admin_margin_percentage: 1,
            admin_margin_price_adult: 1,
            admin_margin_price_child: 1,
            admin_margin_price_infant: 1,
            hotel_itinerary_array: 1,
            extra_food_array: 1
          }
        }
      ]);
      for (const item of display_book_packages) {
        const categoryIds = Array.isArray(item.category)
          ? item.category
          : typeof item.category === "string"
            ? item.category.split(",")
            : [];
        const categoryNames = await getCategoryNames(categoryIds);
        const categoryNamesArray = categoryNames.map((cat) => cat.category_name);
        item.category = categoryNamesArray;
      }

      for (let i = 0; i < display_book_packages.length; i++) {
        const itinerary = display_book_packages[i].booked_itinerary;
        if (itinerary && Array.isArray(itinerary)) {
          for (let j = 0; j < itinerary.length; j++) {
            const currentItinerary = itinerary[j];
            if (currentItinerary && currentItinerary.photo) {
              currentItinerary.photo = await image_url(fn, currentItinerary.photo);
            }
          }
        }
      }

      this.sendJSONResponse(
        res,
        "display book package details",
        {
          length: 1
        },
        display_book_packages
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // Define async function to handle book package details display
  async displayBookPackagesDetails_jaydev(req, res) {
    try {
      // Extract id and token data from request
      const id = req.query._id;
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({ message: "Auth fail" });
      }

      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData.length === 0 || (userData[0].role !== "agency" && userData[0].role !== "admin")) {
        throw new Forbidden("You are not agency or admin");
      }

      // Validate the id parameter
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid book package ID" });
      }

      const getCategoryNames = async (categoryIds) => {
        if (!categoryIds || categoryIds.length === 0) return [];
        const validCategoryIds = categoryIds.map((id) => mongoose.Types.ObjectId(id));
        const categoryNames = await destinationCategorySchema.find({ _id: { $in: validCategoryIds } }, "category_name");
        return categoryNames.map((category) => ({
          _id: category._id.toString(),
          category_name: category.category_name
        }));
      };

      const baseHotelPhotoURL = "https://start-your-tour-api.onrender.com/images/hotel_itienrary/";

      // Fetch book package details with aggregation
      const displayBookPackagesDetails = await bookpackageschema.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(id) }
        },
        {
          $lookup: {
            from: "itineries",
            localField: "booked_itinerary",
            foreignField: "_id",
            as: "book_package_itinerary"
          }
        },
        {
          $lookup: {
            from: "hotel_itienraries",
            localField: "book_package_itinerary.hotel_itienrary_id",
            foreignField: "_id",
            as: "hotel_itienrary"
          }
        },
        {
          $addFields: {
            booked_itinerary: {
              $map: {
                input: "$book_package_itinerary",
                as: "itinerary",
                in: {
                  $mergeObjects: [
                    "$$itinerary",
                    {
                      photo: {
                        $concat: [image_url, "$$itinerary.photo"]
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $addFields: {
            hotel_itienrary: {
              $map: {
                input: "$hotel_itienrary",
                as: "hotel",
                in: {
                  $mergeObjects: [
                    "$$hotel",
                    {
                      days: {
                        $reduce: {
                          input: {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$booked_itinerary",
                                  as: "itinerary",
                                  cond: {
                                    $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"]
                                  }
                                }
                              },
                              as: "itinerary",
                              in: {
                                $toString: "$$itinerary.day"
                              }
                            }
                          },
                          initialValue: "",
                          in: {
                            $cond: {
                              if: { $eq: ["$$value", ""] },
                              then: "$$this",
                              else: { $concat: ["$$value", ",", "$$this"] }
                            }
                          }
                        }
                      },
                      hotel_photo: {
                        $map: {
                          input: "$$hotel.hotel_photo",
                          as: "photo",
                          in: {
                            $concat: [baseHotelPhotoURL, "$$photo"]
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: "destination_categories",
            localField: "category",
            foreignField: "_id",
            as: "destination_categories"
          }
        },
        {
          $lookup: {
            from: "destinations",
            localField: "destination_categories._id",
            foreignField: "_id",
            as: "destinations"
          }
        },
        {
          $lookup: {
            from: "packages",
            localField: "package_id",
            foreignField: "_id",
            as: "package_details",
            pipeline: [
              {
                $lookup: {
                  from: "destinations",
                  localField: "destination",
                  foreignField: "_id",
                  as: "destination"
                }
              },
              {
                $lookup: {
                  from: "agencypersonals",
                  localField: "user_id",
                  foreignField: "user_id",
                  as: "agencypersonals"
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bid",
            pipeline: [
              {
                $lookup: {
                  from: "agencypersonals",
                  localField: "agency_id",
                  foreignField: "user_id",
                  as: "agencypersonals"
                }
              }
            ]
          }
        },
        {
          $project: {
            "_id": 1,
            "user_registration_id": 1,
            "bookdate": 1,
            "payment_type": 1,
            "contact_number": 1,
            "email_id": 1,
            "approx_start_date": 1,
            "totaldays": 1,
            "totalnight": 1,
            "meal": 1,
            "title": 1,
            "meal_type": 1,
            "siteseeing": 1,
            "transport_mode": 1,
            "transport_include_exclude": 1,
            "hoteltype": 1,
            "transaction_id": 1,
            "priceperperson": 1,
            "total_person": 1,
            "gst_price": 1,
            "agency_contect_no": 1,
            "agency_phone_no": 1,
            "category": 1,
            "booked_include": 1,
            "package_type": 1,
            "booked_exclude": 1,
            "othere_requirement": 1,
            "custom_package_id": 1,
            "departure": 1,
            "destination": 1,
            "approx_end_date": 1,
            "user_name": 1,
            "payment_type_on_booking": 1,
            "status": 1,
            "state": 1,
            "city": 1,
            "notificationTokens": 1,
            "status_chenged_by": 1,
            "total_adult": 1,
            "total_child": 1,
            "total_infant": 1,
            "personal_care": 1,
            "agency_id": 1,
            "agencyname": 1,
            "bid_date": 1,
            "bid_id": 1,
            "agencyprice": 1,
            "booked_itinerary": 1,
            "package_details": 1,
            "hotel_itienrary": 1,
            "breakfast_price": 1,
            "lunch_price": 1,
            "dinner_price": 1,
            "price_per_person_child": 1,
            "price_per_person_adult": 1,
            "price_per_person_infant": 1,
            "room_sharing": 1,
            "total_amount": 1,
            "travel_details": 1,
            "gst_address": 1,
            "destination_arrival_date": 1,
            "payment": 1,
            "admin_margin_percentage": 1,
            "admin_margin_price_adult": 1,
            "admin_margin_price_child": 1,
            "admin_margin_price_infant": 1,
            "bid.agencypersonals.agency_name": 1,
            "bid.agencypersonals.mobile_number": 1,
            "bid.agencypersonals.email_address": 1,
            "bid.agencypersonals.city": 1,
            "hotel_itinerary_array": 1,
            "extra_food_array": 1
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "user_registration_id",
            foreignField: "_id",
            as: "customer",
            pipeline: [
              {
                $lookup: {
                  from: "customers",
                  localField: "_id",
                  foreignField: "user_id",
                  as: "customer_detail"
                }
              },
              {
                $project: {
                  password: 0 // Exclude password field from users
                }
              }
            ]
          }
        }
      ]);

      for (const item of displayBookPackagesDetails) {
        const categoryIds = Array.isArray(item.category)
          ? item.category
          : typeof item.category === "string"
            ? item.category.split(",")
            : [];
        const categoryNames = await getCategoryNames(categoryIds);
        const categoryNamesArray = categoryNames.map((cat) => cat.category_name);
        item.category = categoryNamesArray;
      }

      for (let i = 0; i < displayBookPackagesDetails.length; i++) {
        const itinerary = displayBookPackagesDetails[i].booked_itinerary;
        if (itinerary && Array.isArray(itinerary)) {
          for (let j = 0; j < itinerary.length; j++) {
            const currentItinerary = itinerary[j];
            if (currentItinerary && currentItinerary.photo) {
              currentItinerary.photo = await image_url(fn, currentItinerary.photo);
            }
          }
        }
      }

      // Send JSON response with book package details
      return res.status(200).json({
        code: 200,
        status: "OK",
        message: "Display book package details",
        metadata: { length: displayBookPackagesDetails.length },
        data: displayBookPackagesDetails
      });
    } catch (error) {
      // Log error if NotFound instance
      if (error instanceof NotFound) {
        console.log(error);
      }
      // Send error response
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async displayBookPackagesDetails_jaydev(req, res) {
  //   try {
  //     // Extract id and token data from request
  //     const id = req.query._id;
  //     const tokenData = req.userData;

  //     if (!tokenData) {
  //       return res.status(401).json({ message: "Auth fail" });
  //     }

  //     const userData = await userSchema.find({ _id: tokenData.id });
  //     if (userData.length === 0 || (userData[0].role !== "agency" && userData[0].role !== "admin")) {
  //       throw new Forbidden("You are not agency or admin");
  //     }

  //     // Validate the id parameter
  //     if (!id || !mongoose.Types.ObjectId.isValid(id)) {
  //       return res.status(400).json({ message: "Invalid book package ID" });
  //     }

  //     const getCategoryNames = async (categoryIds) => {
  //       if (!categoryIds || categoryIds.length === 0) return [];
  //       const validCategoryIds = categoryIds.map(id => mongoose.Types.ObjectId(id));
  //       const categoryNames = await destinationCategorySchema.find({ _id: { $in: validCategoryIds } }, 'category_name');
  //       return categoryNames.map(category => ({ _id: category._id.toString(), category_name: category.category_name }));
  //     };

  //     // Fetch book package details with aggregation

  //     const displayBookPackagesDetails = await bookpackageschema.aggregate([
  //       {
  //         $match: { _id: mongoose.Types.ObjectId(id) }
  //       },
  //       {
  //         $lookup: {
  //           from: "itineries",
  //           localField: "booked_itinerary",
  //           foreignField: "_id",
  //           as: "book_package_itinerary"
  //         }
  //       },
  //       {
  //         $addFields: {
  //           booked_itinerary: {
  //             $map: {
  //               input: "$book_package_itinerary",
  //               as: "itinerary",
  //               in: {
  //                 $mergeObjects: [
  //                   "$$itinerary",
  //                   {
  //                     photo: {
  //                       $concat: [
  //                         image_url,
  //                         "$$itinerary.photo"
  //                       ]
  //                     }
  //                   }
  //                 ]
  //               }
  //             }
  //           }
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "destination_categories",
  //           localField: "category",
  //           foreignField: "_id",
  //           as: "destination_categories"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "destinations",
  //           localField: "destination_categories._id",
  //           foreignField: "_id",
  //           as: "destinations"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "bids",
  //           localField: "bid_package_id",
  //           foreignField: "_id",
  //           as: "bid",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "agencypersonals",
  //                 localField: "agency_id",
  //                 foreignField: "user_id",
  //                 as: "agencypersonals"
  //               }
  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $addFields: {
  //           destination: { $first: "$bid.destination" },
  //         }
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           user_registration_id: 1,
  //           bookdate: 1,
  //           payment_type: 1,
  //           contact_number: 1,
  //           email_id: 1,
  //           approx_start_date: 1,
  //           totaldays: 1,
  //           totalnight: 1,
  //           meal: 1,
  //           meal_type: 1,
  //           siteseeing: 1,
  //           transport_mode: 1,
  //           transport_include_exclude: 1,
  //           hoteltype: 1,
  //           priceperperson: 1,
  //           total_person: 1,
  //           agency_contect_no: 1,
  //           agency_phone_no: 1,
  //           category: 1,
  //           booked_include: 1,
  //           booked_exclude: 1,
  //           othere_requirement: 1,
  //           custom_package_id: 1,
  //           departure: 1,
  //           destination: 1,
  //           approx_end_date: 1,
  //           user_name: 1,
  //           status: 1,
  //           state: 1,
  //           city: 1,
  //           notificationTokens: 1,
  //           status_chenged_by: 1,
  //           total_adult: 1,
  //           total_child: 1,
  //           total_infant: 1,
  //           personal_care: 1,
  //           agency_id: 1,
  //           agencyname: 1,
  //           bid_date: 1,
  //           bid_id: 1,
  //           agencyprice: 1,
  //           booked_itinerary: 1,
  //           'bid.agencypersonals.agency_name': 1,
  //           'bid.agencypersonals.mobile_number': 1,
  //           'bid.agencypersonals.email_address': 1,
  //           'bid.agencypersonals.city': 1
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "users",
  //           localField: "user_registration_id",
  //           foreignField: "_id",
  //           as: "customer",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "customers",
  //                 localField: "_id",
  //                 foreignField: "user_id",
  //                 as: "customer_detail"
  //               }
  //             },
  //             {
  //               $project: {
  //                 password: 0 // Exclude password field from users
  //               }
  //             }
  //           ]
  //         }
  //       }
  //     ]);

  //     for (const item of displayBookPackagesDetails) {
  //       const categoryIds = Array.isArray(item.category) ? item.category : (typeof item.category === 'string' ? item.category.split(',') : []);
  //       const categoryNames = await getCategoryNames(categoryIds);
  //       const categoryNamesArray = categoryNames.map(cat => cat.category_name);
  //       item.category = categoryNamesArray;
  //     }

  //     for (let i = 0; i < displayBookPackagesDetails.length; i++) {
  //       const itinerary = displayBookPackagesDetails[i].booked_itinerary;
  //       if (itinerary && Array.isArray(itinerary)) {
  //         for (let j = 0; j < itinerary.length; j++) {
  //           const currentItinerary = itinerary[j];
  //           if (currentItinerary && currentItinerary.photo) {
  //             currentItinerary.photo = await image_url(fn, currentItinerary.photo);
  //           }
  //         }
  //       }
  //     }

  //     // Send JSON response with book package details
  //     return res.status(200).json({
  //       code: 200,
  //       status: "OK",
  //       message: "Display book package details",
  //       metadata: { length: displayBookPackagesDetails.length },
  //       data: displayBookPackagesDetails
  //     });
  //   } catch (error) {
  //     // Log error if NotFound instance
  //     if (error instanceof NotFound) {
  //       console.log(error);
  //     }
  //     // Send error response
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  // async display_book_package_for_agency_jaydev(req, res) {
  //   try {
  //     const tokenData = req.userData;

  //     if (!tokenData) {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }

  //     const userData = await userSchema.find({ _id: tokenData.id });
  //     if (userData[0].role !== "agency") {
  //       throw new Forbidden("You are not an agency");
  //     }

  //     const getCategoryNames = async (categoryIds) => {
  //       try {
  //         if (!categoryIds || categoryIds.length === 0) {
  //           return [];
  //         }

  //         if (typeof categoryIds === 'string') {
  //           categoryIds = categoryIds.split(',');
  //         }

  //         const validCategoryIds = categoryIds
  //           .filter(id => mongoose.Types.ObjectId.isValid(id))
  //           .map(id => mongoose.Types.ObjectId(id));

  //         if (validCategoryIds.length === 0) {
  //           return [];
  //         }

  //         const categoryNames = await destinationCategorySchema.find({ _id: { $in: validCategoryIds } }, 'category_name');
  //         return categoryNames.map(category => ({ _id: category._id.toString(), category_name: category.category_name }));
  //       } catch (error) {
  //         throw error;
  //       }
  //     };

  //     const display_book_package_for_agency = await Bidschema.aggregate([
  //       {
  //         $match: {
  //           agency_id: mongoose.Types.ObjectId(tokenData.id)
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "destination_categories",
  //           localField: "destination_category",
  //           foreignField: "_id",
  //           as: "destination_categories"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "book_packages",
  //           localField: "_id",
  //           foreignField: "bid_package_id",
  //           as: "book_package",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "users",
  //                 localField: "user_registration_id",
  //                 foreignField: "_id",
  //                 as: "users_details"
  //               },
  //             },
  //           ]
  //         }
  //       },
  //       {
  //         $match: { book_package: { $ne: [] } }
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           agency_id: 1,
  //           custom_requirement_id: 1,
  //           price_per_person: 1,
  //           bid_date: 1,
  //           total_days: 1,
  //           total_nights: 1,
  //           travel_by: 1,
  //           sightseeing: 1,
  //           hotel_types: 1,
  //           meal_required: 1,
  //           meal_types: 1,
  //           departure: 1,
  //           destination: 1,
  //           total_adult: 1,
  //           total_child: 1,
  //           Infant: 1,
  //           include_details: 1,
  //           start_date: 1,
  //           end_date: 1,
  //           destination_category: 1,
  //           include_services: 1,
  //           exclude_services: 1,
  //           total_amount: 1,
  //           bid_status: 1,
  //           additional_requirement: 1,
  //           personal_care: 1,
  //           createdAt: 1,
  //           updatedAt: 1,
  //           book_package: 1
  //         }
  //       }
  //     ]);

  //     // Process categories
  //     for (const item of display_book_package_for_agency) {
  //       const categoryIds = Array.isArray(item.destination_category) ? item.destination_category : (typeof item.destination_category === 'string' ? item.destination_category.split(',') : []);
  //       const categoryNames = await getCategoryNames(categoryIds);
  //       const categoryNamesArray = categoryNames.map(cat => cat.category_name);
  //       item.destination_category = categoryNamesArray;
  //     }

  //     // Process itinerary photos
  //     for (let i = 0; i < display_book_package_for_agency.length; i++) {
  //       const bookPackages = display_book_package_for_agency[i].book_package;
  //       if (bookPackages && Array.isArray(bookPackages)) {
  //         for (let j = 0; j < bookPackages.length; j++) {
  //           const itineraries = bookPackages[j].booked_itinerary;
  //           if (itineraries && Array.isArray(itineraries)) {
  //             for (let k = 0; k < itineraries.length; k++) {
  //               const currentItinerary = itineraries[k];
  //               if (currentItinerary && currentItinerary.photo) {
  //                 currentItinerary.photo = await image_url(currentItinerary.photo);
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }

  //     display_book_package_for_agency.sort((a, b) => b.createdAt - a.createdAt);

  //     let fixedPackages = await packageSchema.aggregate([
  //       {
  //         $match: { user_id: mongoose.Types.ObjectId(tokenData.id) }
  //       },
  //       {
  //         $lookup: {
  //           from: "destination_categories",
  //           localField: "destination_category_id",
  //           foreignField: "_id",
  //           as: "destination_categories"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "book_packages",
  //           localField: "_id",
  //           foreignField: "package_id",
  //           as: "book_package",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "users",
  //                 localField: "user_registration_id",
  //                 foreignField: "_id",
  //                 as: "users_details"
  //               },
  //             },
  //           ]
  //         }
  //       },
  //       {
  //         $match: { book_package: { $ne: [] } }
  //       },
  //       // {
  //       //   $addFields: {
  //       //     package_agency_id: "$user_id",
  //       //     package_user_phone_no: { $arrayElemAt: ["$book_package.users_details.phone", 0] },
  //       //     package_date: "$updatedAt",
  //       //     package_id: "$_id",
  //       //     package_destination: { $arrayElemAt: ["$destination.destination_name", 0] }
  //       //   }
  //       // },
  //       // {
  //       //   $project: {
  //       //     _id: 1,
  //       //     user_id: 1,
  //       //     package_name: 1,
  //       //     destination_category: 1,
  //       //     price: 1,
  //       //     description: 1,
  //       //     book_package: 1,
  //       //     package_agency_id: 1,
  //       //     package_user_phone_no: 1,
  //       //     package_date: 1,
  //       //     package_id: 1,
  //       //     package_destination: 1
  //       //   }
  //       // }
  //     ]);

  //     // Process categories for fixed packages
  //     for (const item of fixedPackages) {
  //       const categoryIds = Array.isArray(item.destination_category) ? item.destination_category : (typeof item.destination_category === 'string' ? item.destination_category.split(',') : []);
  //       const categoryNames = await getCategoryNames(categoryIds);
  //       const categoryNamesArray = categoryNames.map(cat => cat.category_name);
  //       item.destination_category = categoryNamesArray;
  //     }

  //     // Merge both results
  //     const combinedPackages = display_book_package_for_agency.concat(fixedPackages);

  //     this.sendJSONResponse(
  //       res,
  //       "display book package for agency",
  //       {
  //         length: combinedPackages.length
  //       },
  //       combinedPackages
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error);
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  // async display_booked_package_for_agency(req, res) {
  //   try {
  //     const tokenData = req.userData;

  //     if (!tokenData) {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }

  //     const userData = await userSchema.find({ _id: tokenData.id });
  //     if (userData[0].role !== "agency") {
  //       throw new Forbidden("you are not agency");
  //     }

  //     let booked_package_details = await bookpackageschema.aggregate([
  //       {
  //         $lookup: {
  //           from: 'bids',
  //           localField: 'bid_package_id',
  //           foreignField: '_id',
  //           as: 'bid',
  //           pipeline: [
  //             {
  //               $match: { agency_id: mongoose.Types.ObjectId(tokenData.id) }
  //             },
  //             {
  //               $lookup: {
  //                 from: "destination_categories",
  //                 localField: "destination_category",
  //                 foreignField: "_id",
  //                 as: "destination_categories"
  //               }
  //             },
  //             {
  //               $lookup: {
  //                 from: "book_packages",
  //                 localField: "_id",
  //                 foreignField: "bid_package_id",
  //                 as: "book_package",
  //                 pipeline: [
  //                   {
  //                     $lookup: {
  //                       from: "users",
  //                       localField: "user_registration_id",
  //                       foreignField: "_id",
  //                       as: "users_details"
  //                     },
  //                   },
  //                 ]
  //               }
  //             },
  //             {
  //               $match: { book_package: { $ne: [] } }
  //             },
  //           ]
  //         }
  //       },
  //     ]);

  //     this.sendJSONResponse(
  //       res,
  //       "display booked package details",
  //       {
  //         length: booked_package_details.length
  //       },
  //       booked_package_details
  //     );

  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  // async display_booked_package_for_agency(req, res) {
  //   try {
  //     const tokenData = req.userData;

  //     if (!tokenData) {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }

  //     const userData = await userSchema.find({ _id: tokenData.id });
  //     if (userData[0].role !== "agency") {
  //       throw new Forbidden("you are not agency");
  //     }

  //     const getCategoryNames = async (categoryIds) => {
  //       try {
  //         if (!categoryIds || categoryIds.length === 0) {
  //           return [];
  //         }

  //         if (typeof categoryIds === 'string') {
  //           categoryIds = categoryIds.split(',');
  //         }

  //         const validCategoryIds = categoryIds
  //           .filter(id => mongoose.Types.ObjectId.isValid(id))
  //           .map(id => mongoose.Types.ObjectId(id));

  //         if (validCategoryIds.length === 0) {
  //           return [];
  //         }

  //         const categoryNames = await destinationCategorySchema.find({ _id: { $in: validCategoryIds } }, 'category_name');
  //         return categoryNames.map(category => ({ _id: category._id.toString(), category_name: category.category_name }));
  //       } catch (error) {
  //         throw error;
  //       }
  //     };

  //     // Aggregate bid packages booked by the agency
  //     // let bidPackages = await bookpackageschema.aggregate([
  //     //   {
  //     //     $lookup: {
  //     //       from: 'bids',
  //     //       localField: 'bid_package_id',
  //     //       foreignField: '_id',
  //     //       as: 'bid',
  //     //       pipeline: [
  //     //         {
  //     //           $match: { agency_id: mongoose.Types.ObjectId(tokenData.id) }
  //     //         },
  //     //         {
  //     //           $lookup: {
  //     //             from: "destination_categories",
  //     //             localField: "destination_category",
  //     //             foreignField: "_id",
  //     //             as: "destination_categories"
  //     //           }
  //     //         },
  //     //         {
  //     //           $lookup: {
  //     //             from: "book_packages",
  //     //             localField: "_id",
  //     //             foreignField: "bid_package_id",
  //     //             as: "book_package",
  //     //             pipeline: [
  //     //               {
  //     //                 $lookup: {
  //     //                   from: "users",
  //     //                   localField: "user_registration_id",
  //     //                   foreignField: "_id",
  //     //                   as: "users_details"
  //     //                 },
  //     //               },
  //     //             ]
  //     //           }
  //     //         },
  //     //         {
  //     //           $match: { book_package: { $ne: [] } }
  //     //         },
  //     //         {
  //     //           $project: {
  //     //             _id: 1,
  //     //             agency_id: 1,
  //     //             custom_requirement_id: 1,
  //     //             price_per_person: 1,
  //     //             bid_date: 1,
  //     //             total_days: 1,
  //     //             total_nights: 1,
  //     //             travel_by: 1,
  //     //             sightseeing: 1,
  //     //             hotel_types: 1,
  //     //             meal_required: 1,
  //     //             meal_types: 1,
  //     //             departure: 1,
  //     //             destination: 1,
  //     //             total_adult: 1,
  //     //             total_child: 1,
  //     //             Infant: 1,
  //     //             include_details: 1,
  //     //             start_date: 1,
  //     //             end_date: 1,
  //     //             destination_category: {
  //     //               $map: {
  //     //                 input: "$destination_category",
  //     //                 as: "catId",
  //     //                 in: {
  //     //                   $arrayElemAt: ["$destination_categories.category_name", {
  //     //                     $indexOfArray: ["$destination_categories._id", "$$catId"]
  //     //                   }]
  //     //                 }
  //     //               }
  //     //             },
  //     //             include_services: 1,
  //     //             exclude_services: 1,
  //     //             total_amount: 1,
  //     //             bid_status: 1,
  //     //             additional_requirement: 1,
  //     //             personal_care: 1,
  //     //             createdAt: 1,
  //     //             updatedAt: 1,
  //     //             book_package: 1
  //     //           }
  //     //         }
  //     //       ]
  //     //     }
  //     //   }
  //     // ]);

  //     // Aggregate fixed packages booked under the agency
  //     let fixedPackages = await bookpackageschema.aggregate([
  //       {
  //         $lookup: {
  //           from: "packages",
  //           localField: "package_id",
  //           foreignField: "_id",
  //           as: "package_details",
  //           pipeline: [
  //             {
  //               $match: { user_id: mongoose.Types.ObjectId(tokenData.id) }
  //             },
  //             {
  //               $lookup: {
  //                 from: 'destinations',
  //                 localField: 'destination',
  //                 foreignField: '_id',
  //                 as: 'destination'
  //               }
  //             },
  //             {
  //               $lookup: {
  //                 from: 'book_packages',
  //                 localField: '_id',
  //                 foreignField: 'package_id',
  //                 as: 'bookpackage_details',
  //                 pipeline: [
  //                   {
  //                     $lookup: {
  //                       from: "users",
  //                       localField: "user_registration_id",
  //                       foreignField: "_id",
  //                       as: "users_details"
  //                     },
  //                   },
  //                   {
  //                     $project: {
  //                       'users_details.password': 0
  //                     }
  //                   }
  //                 ]
  //               }
  //             },
  //           ]
  //         }
  //       }
  //     ]);

  //     // Combine results from both aggregations
  //     let booked_package_details = [...fixedPackages];

  //     // Process categories for bid packages
  //     for (const item of booked_package_details) {
  //       if (item.bid) {
  //         for (const bid of item.bid) {
  //           const categoryIds = Array.isArray(bid.destination_category) ? bid.destination_category : (typeof bid.destination_category === 'string' ? bid.destination_category.split(',') : []);
  //           const categoryNames = await getCategoryNames(categoryIds);
  //           const categoryNamesArray = categoryNames.map(cat => cat.category_name);
  //           bid.destination_category = categoryNamesArray;
  //         }
  //       }
  //     }

  //     this.sendJSONResponse(
  //       res,
  //       "display booked package details",
  //       {
  //         length: booked_package_details.length
  //       },
  //       booked_package_details
  //     );

  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async display_book_package_for_agency_jaydev(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }

      const userData = await userSchema.findById(tokenData.id);
      if (!userData || userData.role !== "agency") {
        throw new Forbidden("you are not an agency");
      }

      const display_book_package_for_agency = await bookpackageschema.aggregate([
        {
          $match: { status: "booked" }
        },
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bidDetails",
            pipeline: [
              {
                $lookup: {
                  from: "destinations",
                  localField: "destination",
                  foreignField: "destination_name",
                  as: "Destination"
                }
              },
              {
                $unwind: {
                  path: "$Destination",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $lookup: {
                  from: "place_to_visits",
                  localField: "Destination._id",
                  foreignField: "destination_id",
                  as: "Places_to_visit",
                  pipeline: [
                    {
                      $project: {
                        _id: 0, // Exclude the _id field
                        photo: 1 // Include only the photo field
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  // Take the first photo from the Places_to_visit array
                  photo: {
                    $concat: [BASE_URL, { $arrayElemAt: ["$Places_to_visit.photo", 0] }]
                  }
                }
              },
              {
                $project: {
                  Places_to_visit: 0, // Exclude the entire Places_to_visit array
                  Destination: 0 // Exclude the entire Places_to_visit array
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "packages",
            localField: "package_id",
            foreignField: "_id",
            as: "packageDetails",
            pipeline: [
              {
                $lookup: {
                  from: "destinations",
                  localField: "destination",
                  foreignField: "_id",
                  as: "destination"
                }
              },
              {
                $lookup: {
                  from: "place_to_visits",
                  localField: "place_to_visit_id",
                  foreignField: "_id",
                  as: "place_to_visits_photo",
                  pipeline: [
                    {
                      $project: {
                        _id: 0, // Exclude the _id field
                        photo: 1 // Include only hotel_name field
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  photo: {
                    $concat: [BASE_URL, { $arrayElemAt: ["$place_to_visits_photo.photo", 0] }]
                  }
                }
              },
              {
                $project: {
                  place_to_visits_photo: 0
                }
              }
            ]
          }
        },
        {
          $addFields: {
            isBid: { $gt: [{ $size: "$bidDetails" }, 0] },
            agency_id: {
              $cond: {
                if: { $gt: [{ $size: "$bidDetails" }, 0] },
                then: { $arrayElemAt: ["$bidDetails.agency_id", 0] },
                else: { $arrayElemAt: ["$packageDetails.user_id", 0] }
              }
            }
          }
        },
        {
          $match: { agency_id: mongoose.Types.ObjectId(tokenData.id) }
        },
        {
          $lookup: {
            from: "destination_categories",
            localField: "bidDetails.destination_category",
            foreignField: "_id",
            as: "destinationCategories"
          }
        },
        {
          $lookup: {
            from: "destination_categories",
            localField: "packageDetails.destination_category_id",
            foreignField: "_id",
            as: "destinationPackageCategories"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "user_registration_id",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        {
          $project: {
            "_id": 1,
            "user_registration_id": 1,
            "bookdate": 1,
            "payment_type": 1,
            "bid_package_id": 1,
            "package_id": 1,
            "total_adult": 1,
            "total_child": 1,
            "total_infant": 1,
            "contact_number": 1,
            "email_id": 1,
            "gst_price": 1,
            "approx_start_date": 1,
            "totaldays": 1,
            "totalnight": 1,
            "meal": 1,
            "meal_type": 1,
            "siteseeing": 1,
            "transaction_id": 1,
            "transport_mode": 1,
            "transport_include_exclude": 1,
            "title": 1,
            "hoteltype": 1,
            "priceperperson": 1,
            "total_person": 1,
            "payment_type_on_booking": 1,
            "agency_contect_no": 1,
            "category": 1,
            "booked_include": 1,
            "booked_exclude": 1,
            "personal_care": 1,
            "othere_requirement": 1,
            "package_type": 1,
            "custom_package_id": 1,
            "departure": 1,
            "destination": 1,
            "approx_end_date": 1,
            "user_name": 1,
            "status": 1,
            "status_chenged_by": 1,
            "state": 1,
            "city": 1,
            "notificationTokens": 1,
            "booked_itinerary": 1,
            "isBid": 1,
            "bidDetails": 1,
            "packageDetails": 1,
            "destinationCategories": 1,
            "destinationPackageCategories": 1,
            "hotel_itienrary": 1,
            "price_per_person_child": 1,
            "price_per_person_adult": 1,
            "price_per_person_infant": 1,
            "room_sharing": 1,
            "total_amount": 1,
            "travel_details": 1,
            "gst_address": 1,
            "destination_arrival_date": 1,
            "payment": 1,
            "admin_margin_percentage": 1,
            "admin_margin_price_adult": 1,
            "admin_margin_price_child": 1,
            "admin_margin_price_infant": 1,
            "userDetails.phone": 1,
            "breakfast_price": 1,
            "lunch_price": 1,
            "dinner_price": 1,
            "hotel_itinerary_array": 1,
            "extra_food_array": 1
          }
        }
      ]);

      display_book_package_for_agency.sort().reverse();

      this.sendJSONResponse(
        res,
        "display book package for agency",
        {
          length: display_book_package_for_agency.length
        },
        display_book_package_for_agency
      );

      // res.json({
      //   message: "display book package for agency",
      //   length: display_book_package_for_agency.length,
      //   data: display_book_package_for_agency
      // });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async display_book_package_for_admin(req, res) {
    try {
      const tokenData = req.userData;

      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }

      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const getCategoryNames = async (categoryIds) => {
        try {
          if (!categoryIds || categoryIds.length === 0) {
            return [];
          }

          if (typeof categoryIds === "string") {
            categoryIds = categoryIds.split(",");
          }

          const validCategoryIds = categoryIds
            .filter((id) => mongoose.Types.ObjectId.isValid(id))
            .map((id) => mongoose.Types.ObjectId(id));

          if (validCategoryIds.length === 0) {
            return [];
          }

          const categoryNames = await destinationCategorySchema.find(
            { _id: { $in: validCategoryIds } },
            "category_name"
          );
          return categoryNames.map((category) => ({
            _id: category._id.toString(),
            category_name: category.category_name
          }));
        } catch (error) {
          throw error;
        }
      };

      const { agency_id } = req.query;

      const display_book_package_for_admin = await bookpackageschema.aggregate([
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bidDetails"
          }
        },
        {
          $lookup: {
            from: "packages",
            localField: "package_id",
            foreignField: "_id",
            as: "packageDetails",
            pipeline: [
              {
                $lookup: {
                  from: "destinations",
                  localField: "destination",
                  foreignField: "_id",
                  as: "destination"
                }
              }
            ]
          }
        },
        {
          $addFields: {
            isBid: { $gt: [{ $size: "$bidDetails" }, 0] },
            agency_id: {
              $cond: {
                if: { $gt: [{ $size: "$bidDetails" }, 0] },
                then: { $arrayElemAt: ["$bidDetails.agency_id", 0] },
                else: { $arrayElemAt: ["$packageDetails.user_id", 0] }
              }
            }
          }
        },
        {
          $match: { agency_id: mongoose.Types.ObjectId(agency_id) }
        },
        {
          $lookup: {
            from: "destination_categories",
            localField: "bidDetails.destination_category",
            foreignField: "_id",
            as: "destinationCategories"
          }
        },
        {
          $lookup: {
            from: "destination_categories",
            localField: "packageDetails.destination_category_id",
            foreignField: "_id",
            as: "destinationPackageCategories"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "user_registration_id",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        {
          $project: {
            "_id": 1,
            "user_registration_id": 1,
            "bookdate": 1,
            "payment_type": 1,
            "bid_package_id": 1,
            "transaction_id": 1,
            "package_id": 1,
            "total_adult": 1,
            "total_child": 1,
            "total_infant": 1,
            "contact_number": 1,
            "email_id": 1,
            "approx_start_date": 1,
            "totaldays": 1,
            "totalnight": 1,
            "meal": 1,
            "meal_type": 1,
            "package_type": 1,
            "siteseeing": 1,
            "transport_mode": 1,
            "transport_include_exclude": 1,
            "payment_type_on_booking": 1,
            "gst_price": 1,
            "hoteltype": 1,
            "priceperperson": 1,
            "title": 1,
            "total_person": 1,
            "agency_contect_no": 1,
            "category": 1,
            "booked_include": 1,
            "booked_exclude": 1,
            "personal_care": 1,
            "othere_requirement": 1,
            "custom_package_id": 1,
            "departure": 1,
            "approx_end_date": 1,
            "user_name": 1,
            "status": 1,
            "status_chenged_by": 1,
            "state": 1,
            "city": 1,
            "notificationTokens": 1,
            "booked_itinerary": 1,
            "isBid": 1,
            "bidDetails": 1,
            "packageDetails": 1,
            "destinationCategories": 1,
            "destinationPackageCategories": 1,
            "hotel_itienrary": 1,
            "price_per_person_child": 1,
            "price_per_person_adult": 1,
            "price_per_person_infant": 1,
            "room_sharing": 1,
            "total_amount": 1,
            "travel_details": 1,
            "gst_address": 1,
            "destination_arrival_date": 1,
            "payment": 1,
            "admin_margin_percentage": 1,
            "admin_margin_price_adult": 1,
            "admin_margin_price_child": 1,
            "admin_margin_price_infant": 1,
            "userDetails.phone": 1,
            "breakfast_price": 1,
            "lunch_price": 1,
            "dinner_price": 1,
            "hotel_itinerary_array": 1,
            "extra_food_array": 1
          }
        }
      ]);

      display_book_package_for_admin.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      for (const item of display_book_package_for_admin) {
        const categoryIds = Array.isArray(item.destination_category)
          ? item.destination_category
          : typeof item.destination_category === "string"
            ? item.destination_category.split(",")
            : [];
        const categoryNames = await getCategoryNames(categoryIds);
        const categoryNamesArray = categoryNames.map((cat) => cat.category_name);
        item.destination_category = categoryNamesArray;
      }

      for (let i = 0; i < display_book_package_for_admin.length; i++) {
        const bookPackages = display_book_package_for_admin[i].book_package;
        if (bookPackages && Array.isArray(bookPackages)) {
          for (let j = 0; j < bookPackages.length; j++) {
            const itineraries = bookPackages[j].booked_itinerary;
            if (itineraries && Array.isArray(itineraries)) {
              for (let k = 0; k < itineraries.length; k++) {
                const currentItinerary = itineraries[k];
                if (currentItinerary && currentItinerary.photo) {
                  currentItinerary.photo = await image_url(currentItinerary.photo);
                }
              }
            }
          }
        }
      }

      this.sendJSONResponse(
        res,
        "display book package for admin",
        {
          length: display_book_package_for_admin.length
        },
        display_book_package_for_admin
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async admin_booked_package_list(req, res) {
  //   try {
  //     const tokenData = req.userData;
  //     if (tokenData === "") {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }
  //     const userData = await userSchema.find({ _id: tokenData.id });
  //     console.log(userData);
  //     if (userData[0].role !== "admin") {
  //       throw new Forbidden("you are not admin or agency");
  //     }

  //     const bookedPackages = await bookpackageschema.aggregate([
  //       {
  //         $lookup: {
  //           from: 'packages', // collection name in db
  //           localField: 'package_id',
  //           foreignField: '_id',
  //           as: 'packageDetails',
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "destinations",
  //                 localField: "destination",
  //                 foreignField: "_id",
  //                 as: "destination"
  //               }
  //             },
  //             {
  //               $project: {
  //                 'destination.how_to_reach': 0,
  //                 'destination.destination_category_id': 0,
  //                 'destination.about_destination': 0,
  //                 'destination.status': 0,
  //                 'destination.best_time_for_visit': 0,
  //               }
  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $match: {
  //           'packageDetails.user_id': mongoose.Types.ObjectId(tokenData.id)
  //         }
  //       },
  //       {
  //         $project: {
  //           user_registration_id: 1,
  //           bookdate: 1,
  //           payment_type: 1,
  //           bid_package_id: 1,
  //           package_id: 1,
  //           total_adult: 1,
  //           total_child: 1,
  //           total_infant: 1,
  //           contact_number: 1,
  //           email_id: 1,
  //           approx_start_date: 1,
  //           totaldays: 1,
  //           totalnight: 1,
  //           meal: 1,
  //           meal_type: 1,
  //           siteseeing: 1,
  //           transport_mode: 1,
  //           transport_include_exclude: 1,
  //           hoteltype: 1,
  //           priceperperson: 1,
  //           total_person: 1,
  //           agency_contect_no: 1,
  //           category: 1,
  //           booked_include: 1,
  //           transaction_id: 1,
  //           booked_exclude: 1,
  //           personal_care: 1,
  //           othere_requirement: 1,
  //           custom_package_id: 1,
  //           departure: 1,
  //           approx_end_date: 1,
  //           user_name: 1,
  //           status: 1,
  //           status_chenged_by: 1,
  //           state: 1,
  //           city: 1,
  //           notificationTokens: 1,
  //           booked_itinerary: 1,
  //           packageDetails: 1,
  //           hotel_itienrary: 1,
  //           price_per_person_child: 1,
  //           price_per_person_adult: 1,
  //           price_per_person_infant: 1,
  //           room_sharing: 1,
  //           total_amount: 1,
  //         }
  //       }
  //     ]);

  //     this.sendJSONResponse(
  //       res,
  //       "display booked package for admin",
  //       {
  //         length: bookedPackages.length
  //       },
  //       bookedPackages
  //     );

  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async admin_booked_package_list(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }

      const userData = await userSchema.findById(tokenData.id).exec();
      if (!userData) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      if (userData.role !== "admin") {
        throw new Forbidden("You are not an admin");
      }

      // const bookedPackages = await bookpackageschema.aggregate([
      //   {
      //     $lookup: {
      //       from: 'packages',
      //       localField: 'package_id',
      //       foreignField: '_id',
      //       as: 'packageDetails',
      //       pipeline: [
      //         {
      //           $lookup: {
      //             from: "destinations",
      //             localField: "destination",
      //             foreignField: "_id",
      //             as: "destination"
      //           }
      //         },
      //         {
      //           $project: {
      //             'destination.how_to_reach': 0,
      //             'destination.destination_category_id': 0,
      //             'destination.about_destination': 0,
      //             'destination.status': 0,
      //             'destination.best_time_for_visit': 0,
      //           }
      //         }
      //       ]
      //     }
      //   },
      //   {
      //     $lookup: {
      //       from: 'bids',
      //       localField: 'bid_package_id',  // Adjust according to your schema
      //       foreignField: '_id',
      //       as: 'bidDetails',
      //     }
      //   },
      //   {
      //     $project: {
      //       user_registration_id: 1,
      //       bookdate: 1,
      //       payment_type: 1,
      //       bid_package_id: 1,
      //       package_id: 1,
      //       total_adult: 1,
      //       total_child: 1,
      //       total_infant: 1,
      //       contact_number: 1,
      //       email_id: 1,
      //       approx_start_date: 1,
      //       totaldays: 1,
      //       totalnight: 1,
      //       meal: 1,
      //       meal_type: 1,
      //       payment_type_on_booking: 1,
      //       siteseeing: 1,
      //       package_type: 1,
      //       title: 1,
      //       transport_mode: 1,
      //       transport_include_exclude: 1,
      //       hoteltype: 1,
      //       priceperperson: 1,
      //       total_person: 1,
      //       agency_contect_no: 1,
      //       category: 1,
      //       booked_include: 1,
      //       transaction_id: 1,
      //       booked_exclude: 1,
      //       personal_care: 1,
      //       othere_requirement: 1,
      //       custom_package_id: 1,
      //       departure: 1,
      //       approx_end_date: 1,
      //       user_name: 1,
      //       status: 1,
      //       status_chenged_by: 1,
      //       state: 1,
      //       city: 1,
      //       notificationTokens: 1,
      //       booked_itinerary: 1,
      //       packageDetails: 1,
      //       bidDetails: 1,  // Includes bid details
      //       hotel_itienrary: 1,
      //       price_per_person_child: 1,
      //       price_per_person_adult: 1,
      //       price_per_person_infant: 1,
      //       room_sharing: 1,
      //       total_amount: 1,
      //       travel_details: 1,
      //       gst_address: 1,
      //       destination_arrival_date: 1,
      //       payment: 1,
      //       admin_margin_percentage: 1,
      //       admin_margin_price_adult: 1,
      //       admin_margin_price_child: 1,
      //       admin_margin_price_infant: 1,
      //     }
      //   }
      // ]);
      const bookedPackages = await bookpackageschema.find();
      this.sendJSONResponse(
        res,
        "Display booked package and bid package details for admin",
        {
          length: bookedPackages.length
        },
        bookedPackages
      );
    } catch (error) {
      return this.sendErrorResponse(req, res, error);
    }
  }

  async booked_package_details_by_user(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData);
      if (userData[0].role !== "customer") {
        throw new Forbidden("you are not admin");
      }
      let { book_package_id } = req.query;

      let book_package_details_user = await bookpackageschema.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(book_package_id) }
        },
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bid",
            pipeline: [
              {
                $lookup: {
                  from: "agencypersonals",
                  localField: "agency_id",
                  foreignField: "user_id",
                  as: "agencypersonals"
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "itineries",
            localField: "booked_itinerary",
            foreignField: "_id",
            as: "book_package_itinerary"
          }
        },
        {
          $addFields: {
            booked_itinerary: {
              $map: {
                input: "$book_package_itinerary",
                as: "itinerary",
                in: {
                  $mergeObjects: [
                    "$$itinerary",
                    {
                      photo: {
                        $concat: [image_url, "$$itinerary.photo"]
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: "packages", // collection name in db
            localField: "package_id",
            foreignField: "_id",
            as: "packageDetails",
            pipeline: [
              {
                $lookup: {
                  from: "destinations",
                  localField: "destination",
                  foreignField: "_id",
                  as: "destination"
                }
              },
              {
                $lookup: {
                  from: "agencypersonals",
                  localField: "user_id",
                  foreignField: "user_id",
                  as: "agencypersonals"
                }
              },
              {
                $project: {
                  "destination.how_to_reach": 0,
                  "destination.destination_category_id": 0,
                  "destination.about_destination": 0,
                  "destination.status": 0,
                  "destination.best_time_for_visit": 0,
                  "destination.most_loved_destionation": 0
                }
              }
            ]
          }
        }
      ]);

      if (book_package_details_user.length > 0) {
        const packageDetails = book_package_details_user[0].packageDetails;
        if (packageDetails.length !== 0) {
          if (!packageDetails[0].agencypersonals || packageDetails[0].agencypersonals.length === 0) {
            book_package_details_user[0].packageDetails[0].agencypersonals = [
              {
                name: "SYT TravelTech Pvt Ltd",
                phone: "+91 9033251903",
                email: "support@startyourtour.com"
              }
            ];
          }
        }
      }

      for (let i = 0; i < book_package_details_user.length; i++) {
        const itinerary = book_package_details_user[i].booked_itinerary;
        if (itinerary && Array.isArray(itinerary)) {
          for (let j = 0; j < itinerary.length; j++) {
            const currentItinerary = itinerary[j];
            if (currentItinerary && currentItinerary.photo) {
              currentItinerary.photo = await image_url(fn, currentItinerary.photo); // Assuming image_url is a function
            }
          }
        }
      }

      this.sendJSONResponse(
        res,
        "display booked package for user",
        {
          length: book_package_details_user.length
        },
        book_package_details_user
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
