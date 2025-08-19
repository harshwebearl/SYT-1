const BaseController = require("./BaseController");
const agencySchema = require("../models/Agency_personalSchema");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const adminSchema = require("../models/AdminSchema");
const nodemailer = require("nodemailer");
const niv = require("node-input-validator");
const transporter = require("../helper/nodemailerHelper");
const Bidschema = require("../models/bidSchema");
const { generateFilePathForDB, generateDownloadLink, generateFileDownloadLinkPrefix } = require("../utils/utility");
const mongoose = require("mongoose");
const userschema = require("../models/usersSchema");
const supplier_payment_Schema = require("../models/supplier_payments.Schema");
const lead_schema = require("../models/Lead_Schema");
const invoice_schema = require("../models/invoice.schema");
const userSchema = require("../models/usersSchema");
const cms_aboutus_schema = require("../models/cms_aboutus.Schema");
const cms_contactus_schema = require("../models/cms_contactus.Schema");
const cms_settings_homepage_schema = require("../models/cms_settings_homepage.Schema");
const cms_website_setting_schema = require("../models/cms_website_setting.Schema");
const image_url = require("../update_url_path.js");
const bookpackageschema = require("../models/bookpackageschema");
const sgMail = require("@sendgrid/mail");
const packageSchema = require("../models/PackageSchema.js");
const destinationSchema = require("../models/DestinationSchema");
const customerequirementSchema = require("../models/custom_requirementsSchema.js");
const VendorCar = require("../models/vendor_car_schema");
const hotel_model = require("../models/hotel_syt_schema");
const Inquiry = require("../models/inquiry");
const CarBooking = require("../models/car_booking_syt");
const hotel_booking_syt_Schema = require("../models/hotel_booking_syt_schema");
const reviewSchema = require("../models/reviewSchema");
const bcrypt = require("bcrypt");
const Otp = require("../models/otp.js");
const axios = require("axios");
const package_profit_margin = require("../models/package_profit_margin.js");
const notification = require("../models/NotificationSchema.js");
const Notificationschema = require("../models/NotificationSchema.js");
const { getReceiverSocketId, io } = require("../socket/socket.js");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const fn = "agency";

const mailOptions = (email, password) => {
  return {
    from: "krunal.webearl@gmail.com",
    to: email,
    subject: "Password for two loving hands",
    text: password
  };
};

function formatRevenueAmount(amount) {
  if (amount >= 1000000000) {
    // Greater than or equal to 1 Billion (100 Crore)
    return (amount / 1000000000).toFixed(1) + " Billion";
  } else if (amount >= 10000000) {
    // Greater than or equal to 1 Crore
    return (amount / 10000000).toFixed(1) + " Crore";
  } else if (amount >= 1000000) {
    // Greater than or equal to 1 Million
    return (amount / 1000000).toFixed(1) + " Million";
  } else if (amount >= 100000) {
    // Greater than or equal to 1 Lakh
    return (amount / 100000).toFixed(1) + " Lakh";
  }
  return amount; // No formatting needed for smaller amounts
}

module.exports = class AgencyController extends BaseController {
  async RegisterAgency(req, res) {
    try {
      const tokenData = req.userData;
      console.log(req.files);
      let hash = await bcrypt.hash(req.body.password, 10);
      const usersData = {
        phone: req.body.mobile_number,
        password: hash,
        // contect_no: req.body.contect_no,
        role: "agency",
        status: req.body.status
      };

      if (req.body?.is_subadmin) {
        usersData.is_subadmin = req.body.is_subadmin;
      }
      if (tokenData?.id) {
        usersData.admin_id = tokenData.id;
      }
      const schemaData = await userSchema.find({
        phone: usersData.phone,
        role: usersData.role
      });
      console.log(99, schemaData);
      if (schemaData.length !== 0) {
        throw new Forbidden("Data is Already Registered");
      }
      const InsertUsersData = new userSchema(usersData);
      const users_data = await InsertUsersData.save();

      let agency_logo = "";
      if (req.files && req.files.agency_logo && req.files.agency_logo[0]) {
        agency_logo = req.files.agency_logo[0].filename;
      }

      // res.send(req.files);
      const userData = {
        user_id: users_data.id,
        full_name: req.body.full_name,
        mobile_number: req.body.mobile_number,
        email_address: req.body.email_address,
        password: hash,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        pincode: req.body.pincode,
        agency_name: req.body.agency_name,
        business_type: req.body.business_type,

        website: req.body.website,
        agency_address: req.body.agency_address,
        agency_logo: agency_logo,
        IATA: req.body.IATA,
        status: "active",
        GST_NO: req.body.GST_NO
      };

      const insertData = new agencySchema(userData);
      const data = await insertData.save();

      let notificationData = await notification.create({
        user_id: data.user_id,
        title: "Registration Success",
        text: `Welcome ${data.full_name}! Your registration was successful.`,
        user_type: "agency"
      });

      const adminSocketId = getReceiverSocketId(data._id);
      if (adminSocketId) {
        io.to(adminSocketId).emit("newNotification", notificationData);
      }

      const manageaboutus = new cms_aboutus_schema({ agency_id: data.user_id });
      const Add_manageaboutus = await manageaboutus.save();

      const ManageContactUs = new cms_contactus_schema({ agency_id: data.user_id });
      const Add_ManageContactUs = await ManageContactUs.save();

      const ManageHomePageSetting = new cms_settings_homepage_schema({ agency_id: data.user_id });
      const mangehomepagesetting = await ManageHomePageSetting.save();

      const websitesetting = new cms_website_setting_schema({ agency_id: data.user_id });
      const WebSiteSetting = await websitesetting.save();

      return this.sendJSONResponse(
        res,
        "Agency data saved",
        {
          length: 1
        },
        data
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_agency_list_by_admin(req, res) {
    try {
      // const tokenData = req.userData;
      // const adminData = await adminSchema.find({ _id: tokenData.id });
      // if (adminData.length === 0) {
      //   throw new Forbidden("you are not admin");
      // }
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

      const display_all_user_list_by_admin = await userSchema.aggregate([
        {
          $match: { role: "agency" }
        },
        {
          $lookup: {
            from: "agencypersonals",
            localField: "_id",
            foreignField: "user_id",
            as: "agencypersonal",
            pipeline: [
              { $project: { password: 0 } } // Exclude password field
            ]
          }
        },
        {
          $project: {
            password: 0 // Exclude password field from main user document
          }
        }
        // {
        //   $lookup: {
        //     from: "custom_requirements",
        //     localField: "_id",
        //     foreignField: "user_id",
        //     as: "custom_requirement",
        //     pipeline: [
        //       {
        //         $lookup: {
        //           from: "book_packages",
        //           localField: "_id",
        //           foreignField: "custom_package_id",
        //           as: "book_packages"
        //         }
        //       }
        //       // {
        //       //     $match:{"book_packages" : {$ne:[]}}
        //       // }
        //     ]
        //   }
        // }
        //    {
        //     $match:{"custom_requirement" : {$ne:[]}}
        // }
      ]);

      const baseURL = "https://syt-i471.onrender.com/images/agency/";

      for (let i = 0; i < display_all_user_list_by_admin.length; i++) {
        for (let j = 0; j < display_all_user_list_by_admin[i].agencypersonal.length; j++) {
          const agencyLogo = display_all_user_list_by_admin[i].agencypersonal[j].agency_logo;
          if (agencyLogo) {
            display_all_user_list_by_admin[i].agencypersonal[j].agency_logo = baseURL + agencyLogo;
          }
        }
      }

      return this.sendJSONResponse(
        res,
        "display all agency list ",
        {
          length: 1
        },
        display_all_user_list_by_admin
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async agency_full_detail_by_admin(req, res) {
  //   try {
  //     const id = req.query._id;
  //     const tokenData = req.userData;

  //     if (!tokenData) {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }

  //     const packageProfitMargin = await package_profit_margin.find();

  //     const userData = await userSchema.findById(tokenData.id);
  //     if (!userData || userData.role !== "admin") {
  //       return res.status(403).json({
  //         message: "You are not admin"
  //       });
  //     }

  //     const agency_history = await userSchema.aggregate([
  //       { $match: { _id: mongoose.Types.ObjectId(id) } },
  //       {
  //         $lookup: {
  //           from: "agencypersonals",
  //           localField: "_id",
  //           foreignField: "user_id",
  //           as: "agencydetails",
  //           pipeline: [
  //             {
  //               $project: {
  //                 password: 0 // Exclude password field from agencydetails
  //               }
  //             },
  //             {
  //               $lookup: {
  //                 from: "bids",
  //                 localField: "user_id",
  //                 foreignField: "agency_id",
  //                 as: "bid",
  //                 pipeline: [
  //                   {
  //                     $lookup: {
  //                       from: "destination_categories",
  //                       localField: "destination_category",
  //                       foreignField: "_id",
  //                       as: "destination_categories"
  //                     }
  //                   },
  //                   {
  //                     $lookup: {
  //                       from: "book_packages",
  //                       localField: "_id",
  //                       foreignField: "bid_package_id",
  //                       as: "book_package",
  //                       pipeline: [
  //                         {
  //                           $lookup: {
  //                             from: "book_package_itineraries",
  //                             localField: "user_id",
  //                             foreignField: "bid_id",
  //                             as: "book_package_itineraries"
  //                           }
  //                         },
  //                       ]
  //                     }
  //                   }

  //                 ]
  //               }
  //             },

  //           ]
  //         }
  //       },
  //       {
  //         $project: {
  //           password: 0 // Exclude password field from main user document
  //         }
  //       }
  //     ]);

  //     if (agency_history.length === 0) {
  //       return res.status(404).json({
  //         message: "Agency not found"
  //       });
  //     }

  //     if (!agency_history[0].agencydetails || agency_history[0].agencydetails.length === 0) {
  //       return res.status(404).json({
  //         message: "Agency details not found"
  //       });
  //     }

  //     agency_history[0].agencydetails[0].agency_logo = await image_url(
  //       "agency",
  //       agency_history[0].agencydetails[0].agency_logo
  //     );

  //     return this.sendJSONResponse(
  //       res,
  //       "Agency history display",
  //       {
  //         length: agency_history.length
  //       },
  //       agency_history
  //     );
  //   } catch (error) {
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async agency_full_detail_by_admin(req, res) {
    try {
      const id = req.query._id;
      const tokenData = req.userData;

      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }

      // Fetch packageProfitMargin
      const packageProfitMargin = await package_profit_margin.find();

      // Check if packageProfitMargin is empty or undefined
      if (!packageProfitMargin || packageProfitMargin.length === 0) {
        return res.status(404).json({
          message: "No profit margin data found"
        });
      }

      const userData = await userSchema.findById(tokenData.id);
      if (!userData || userData.role !== "admin") {
        return res.status(403).json({
          message: "You are not admin"
        });
      }

      const agency_history = await userSchema.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: "agencypersonals",
            localField: "_id",
            foreignField: "user_id",
            as: "agencydetails",
            pipeline: [
              {
                $project: {
                  password: 0 // Exclude password field from agencydetails
                }
              },
              {
                $lookup: {
                  from: "bids",
                  localField: "user_id",
                  foreignField: "agency_id",
                  as: "bid",
                  pipeline: [
                    {
                      $lookup: {
                        from: "destination_categories",
                        localField: "destination_category",
                        foreignField: "_id",
                        as: "destination_categories"
                      }
                    },
                    {
                      $lookup: {
                        from: "book_packages",
                        localField: "_id",
                        foreignField: "bid_package_id",
                        as: "book_package",
                        pipeline: [
                          {
                            $lookup: {
                              from: "book_package_itineraries",
                              localField: "user_id",
                              foreignField: "bid_id",
                              as: "book_package_itineraries"
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          $project: {
            password: 0 // Exclude password field from main user document
          }
        }
      ]);

      if (agency_history.length === 0) {
        return res.status(404).json({
          message: "Agency not found"
        });
      }

      if (!agency_history[0].agencydetails || agency_history[0].agencydetails.length === 0) {
        return res.status(404).json({
          message: "Agency details not found"
        });
      }

      // Helper function to get month name from date
      const getMonthName = (date) => {
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
        return monthNames[new Date(date).getMonth()];
      };

      // Attach admin margin to each bid based on the start date month
      agency_history[0].agencydetails.forEach((agency) => {
        agency.bid.forEach((bid) => {
          const bidMonth = getMonthName(bid.start_date); // Get the month name
          console.log(bidMonth);

          const userAdminMargin = packageProfitMargin.find((margin) => margin.state_name === bid.destination);

          if (userAdminMargin) {
            const relevantUserMargin = userAdminMargin
              ? userAdminMargin.month_and_margin_user.find((m) => m.month_name === bidMonth)
              : null;

            bid.admin_margin = relevantUserMargin || {
              month_name: bidMonth,
              margin_percentage: "10"
            };
          } else {
            // If no destination is found, set admin_margin to 0 for the current month
            bid.admin_margin = {
              month_name: bidMonth,
              margin_percentage: "10"
            };
          }
        });
      });

      // If there's an agency logo, attach the image URL
      if (agency_history[0].agencydetails[0].agency_logo) {
        agency_history[0].agencydetails[0].agency_logo = await image_url(
          "agency",
          agency_history[0].agencydetails[0].agency_logo
        );
      }

      return res.status(200).json({
        message: "Agency history display",
        length: agency_history.length,
        data: agency_history
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message || "An error occurred"
      });
    }
  }

  async agency_history(req, res) {
    try {
      const tokenData = req.userData;
      if (!req.userData) {
        throw new Error("No Auth");
      }
      if (req.userData.role !== "admin" && req.userData.role !== "agency") {
        throw new Error("You dont have permission");
      }

      let agencyId;
      if (req.userData.type === "admin") {
        agencyId = req.query.agencyId;
      } else {
        agencyId = tokenData.id;
      }

      let isAgencyExist = await userSchema.findById(agencyId);
      if (!isAgencyExist) {
        throw new Error("Agency Does not exist");
      }

      const agency_history = await Bidschema.aggregate([
        { $match: { agency_id: mongoose.Types.ObjectId(agencyId) } }
        // {
        //   $lookup: {
        //     from: "book_packages",
        //     localField: "_id",
        //     foreignField: "bid_package_id",
        //     as: "book_package"
        //   }
        // }
      ]);
      return this.sendJSONResponse(
        res,
        "Agency history display",
        {
          length: 1
        },
        agency_history
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async agency_detail_by_admin(req, res) {
  //   try {
  //     const tokenData = req.userData;
  //     if (!req.userData) {
  //       throw new Error("No Auth");
  //     }
  //     if (req.userData.role !== "admin"){
  //       throw new Error("You dont have permission");
  //     }

  //     let agencyId;
  //     if (req.userData.type === "admin") {
  //       agencyId = req.query.agencyId;
  //     } else {
  //       agencyId = tokenData.id;
  //     }

  //     let isAgencyExist = await userSchema.findById(agencyId);
  //     if (!isAgencyExist) {
  //       throw new Error("Agency Does not exist");
  //     }

  //     const agency_history = await Bidschema.aggregate([
  //       { $match: { agency_id: mongoose.Types.ObjectId(agencyId) } },
  //       // {
  //       //   $lookup: {
  //       //     from: "book_packages",
  //       //     localField: "_id",
  //       //     foreignField: "bid_package_id",
  //       //     as: "book_package"
  //       //   }
  //       // }
  //     ]);
  //     return this.sendJSONResponse(
  //       res,
  //       "Agency history display",
  //       {
  //         length: 1
  //       },
  //       agency_history
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async display_agency_profile(req, res) {
    try {
      const tokenData = req.userData;
      if (!req.userData) {
        throw new Error("No Auth");
      }
      console.log(tokenData);
      if (req.userData.role !== "admin" && req.userData.role !== "agency") {
        throw new Error("You dont have permission");
      }

      let agencyId;
      if (req.userData.role === "admin") {
        agencyId = req.query.agencyId;
      } else {
        agencyId = tokenData.id;
      }

      let isAgencyExist = await agencySchema.findOne({ user_id: agencyId });
      if (!isAgencyExist) {
        throw new Error("Agency Does not exist");
      }

      let AgencyData = await agencySchema.aggregate([
        { $match: { user_id: mongoose.Types.ObjectId(agencyId) } },
        {
          $project: {
            status_change_by: 0,
            password: 0
          }
        }
        // {
        //   $set: {
        //     pancard_image: await image_url('agency', "$pancard_image"),
        //     agency_logo: await image_url('agency', ${agency_logo}"),
        //     status_change_by: null,
        //     password: null
        //   }
        // }
      ]);

      AgencyData[0].agency_logo = await image_url("agency", AgencyData[0].agency_logo);

      return this.sendJSONResponse(res, "display agency profile", {}, AgencyData);
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async getAgencyData(req, res) {
    try {
      const agencyData = await userSchema.aggregate([
        {
          $match: { role: "agency" }
        },
        {
          $lookup: {
            from: "agencypersonals",
            localField: "_id",
            foreignField: "user_id",
            as: "agencypersonals",
            pipeline: [
              {
                $set: {
                  pancard_image: { $concat: [`${generateFileDownloadLinkPrefix(req.localHostURL)}`, "$pancard_image"] },
                  agency_logo: { $concat: [`${generateFileDownloadLinkPrefix(req.localHostURL)}`, "$agency_logo"] }
                }
              },
              {
                $sort: { createdAt: -1 }
              }
            ]
          }
        }
      ]);

      if (agencyData.length === 0) {
        throw new Forbidden("Agency Data Not Found");
      }

      return this.sendJSONResponse(
        res,
        "data retrived",
        {
          length: 1
        },
        agencyData
      );
    } catch (error) {
      console.log(req, res, error);
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async updateAgencyDetail(req, res) {
    try {
      const tokenData = req.userData;
      if (!req.userData) {
        throw new Error("No Auth");
      }
      if (req.userData.role !== "admin" && req.userData.role !== "agency") {
        throw new Error("You dont have permission");
      }

      let agencyId;
      if (req.userData.role === "admin") {
        agencyId = req.query.agencyId;
      } else {
        agencyId = tokenData.id;
      }

      let isAgencyExist = await userSchema.findOne({ user_id: agencyId });
      if (!isAgencyExist) {
        throw new Error("Agency Does not exist");
      }

      // const updateData = {
      //   full_name: req.body.full_name,
      //   pincode: req.body.pincode,
      //   state: req.body.state,
      //   mobile_number: req.body.mobile_number,
      //   skypeid: req.body.skypeid,
      //   city: req.body.city,
      //   country: req.body.country,
      //   email_address: req.body.email_address,
      //   agency_logo: req.files?.agency_logo?.map((file) => generateFilePathForDB(file))?.[0],
      //   agency_name: req.body.agency_name,
      //   // resident_address: req.body.resident_address,
      //   //   pancard_no: req.body.pancard_no,
      //   //   pancard_image: req.files?.pancard_image?.map((file) => generateFilePathForDB(file))?.[0],
      //   //   agency_phone_no: req.body.agency_phone_no,
      //   //   password: req.body.password,
      //   //   agency_phone_no: req.body.agency_phone_no,
      //   //   agency_address: req.body.agency_address,
      //   //   agency_address2: req.body.agency_address2,
      //   //   agency_fax: req.body.agency_fax,
      //   //   agency_pincode: req.body.agency_pincode,
      //   //   agency_country: req.body.agency_country,
      //   //   agency_state: req.body.agency_state,
      //   //   agency_city: req.body.agency_city,
      //   //   business_type: req.body.business_type,
      //   //   IATA: req.body.IATA,
      //   //   year_in_business: req.body.year_in_business,
      //   //   TDS_exemption: req.body.TDS_exemption,
      //   //   TDS_for_exemption: req.body.TDS_for_exemption,
      //   //   reference: req.body.reference,
      //   //   GST_NO: req.body.GST_NO,
      //   //   website: req.body.website,
      //   //   alternate_address: req.body.alternate_address,
      //   //   alternate_phone: req.body.alternate_phone,
      //   //   agency_officespace: req.body.agency_officespace,
      //   //   agency_securitization_mode: req.body.agency_securitization_mode,
      //   //   agency_monthlybookingvolume: req.body.agency_monthlybookingvolume,
      //   //   agency_tdsexemption_percent: req.body.agency_tdsexemption_percent,
      //   //   agency_consolidators: req.body.agency_consolidators,
      //   //   agency_remarks: req.body.agency_remarks,
      //   //   gst_agency_name: req.body.gst_agency_name,
      //   //   gst_agency_classification: req.body.gst_agency_classification,
      //   //   gst_agency_GST: req.body.gst_agency_GST,
      //   //   gst_agency_state: req.body.gst_agency_state,
      //   //   gst_agency_state_code: req.body.gst_agency_state_code,
      //   //   gst_provisional_GST: req.body.gst_provisional_GST,
      //   //   gst_contact_person: req.body.gst_contact_person,
      //   //   gst_phone: req.body.gst_phone,
      //   //   gst_alternate_phone: req.body.gst_alternate_phone,
      //   //   gst_email: req.body.gst_email,
      //   //   gst_alternate_email: req.body.gst_alternate_email,
      //   //   gst_registration_status: req.body.gst_registration_status,
      //   //   gst_hsn_sac_code: req.body.gst_hsn_sac_code,
      //   //   gst_comp_levy_sec10_GST: req.body.gst_comp_levy_sec10_GST,
      //   //   gst_address_line_1: req.body.gst_address_line_1,
      //   //   gst_address_line_2: req.body.gst_address_line_2,
      //   //   gst_pincode: req.body.gst_pincode,
      //   //   gst_agency_city: req.body.gst_agency_city,
      //   //   gst_supply_type: req.body.gst_supply_type
      // };
      const old_data = await agencySchema.find({ user_id: agencyId });
      var pi, al;
      console.log(old_data);
      if (!req.files || !req.files.agency_logo) {
        al = old_data.agency_logo;
      }
      console.log(pi);
      console.log(al);

      let agency_logo = old_data.agency_logo;
      if (req.files && req.files.agency_logo && req.files.agency_logo[0]) {
        agency_logo = req.files.agency_logo[0].filename;
      }

      const updateData = {
        full_name: req.body.full_name,
        mobile_number: req.body.mobile_number,
        email_address: req.body.email_address,
        // password: req.body.password,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        pincode: req.body.pincode,
        agency_name: req.body.agency_name,
        business_type: req.body.business_type,

        GST_NO: req.body.GST_NO,
        agency_logo: agency_logo,
        website: req.body.website,
        IATA: req.body.IATA,
        agency_address: req.body.agency_address

        // resident_address: req.body.resident_address,
        // skypeid: req.body.skypeid,
        // pancard_no: req.body.pancard_no,
        // pancard_image: req.files?.pancard_image?.map((file) => generateFilePathForDB(file))?.[0],
        // agency_phone_no: req.body.agency_phone_no,
        // agency_phone_no: req.body.agency_phone_no,
        // agency_address2: req.body.agency_address2,
        // agency_fax: req.body.agency_fax,
        // agency_pincode: req.body.agency_pincode,
        // agency_country: req.body.agency_country,
        // agency_state: req.body.agency_state,
        // agency_city: req.body.agency_city,
        // year_in_business: req.body.year_in_business,
        // TDS_exemption: req.body.TDS_exemption,
        // TDS_for_exemption: req.body.TDS_for_exemption,
        // reference: req.body.reference,
        // alternate_address: req.body.alternate_address,
        // alternate_phone: req.body.alternate_phone,
        // agency_officespace: req.body.agency_officespace,
        // agency_securitization_mode: req.body.agency_securitization_mode,
        // agency_monthlybookingvolume: req.body.agency_monthlybookingvolume,
        // agency_tdsexemption_percent: req.body.agency_tdsexemption_percent,
        // agency_consolidators: req.body.agency_consolidators,
        // agency_remarks: req.body.agency_remarks,
        // gst_agency_name: req.body.gst_agency_name,
        // gst_agency_classification: req.body.gst_agency_classification,
        // gst_agency_GST: req.body.gst_agency_GST,
        // gst_agency_state: req.body.gst_agency_state,
        // gst_agency_state_code: req.body.gst_agency_state_code,
        // gst_provisional_GST: req.body.gst_provisional_GST,
        // gst_contact_person: req.body.gst_contact_person,
        // gst_phone: req.body.gst_phone,
        // gst_alternate_phone: req.body.gst_alternate_phone,
        // gst_email: req.body.gst_email,
        // gst_alternate_email: req.body.gst_alternate_email,
        // gst_registration_status: req.body.gst_registration_status,
        // gst_hsn_sac_code: req.body.gst_hsn_sac_code,
        // gst_comp_levy_sec10_GST: req.body.gst_comp_levy_sec10_GST,
        // gst_address_line_1: req.body.gst_address_line_1,
        // // gst_address_line_2: req.body.gst_address_line_2,
        // gst_pincode: req.body.gst_pincode,
        // gst_agency_city: req.body.gst_agency_city,
        // gst_supply_type: req.body.gst_supply_type
      };

      const updatedData = await agencySchema.findOneAndUpdate(
        {
          user_id: agencyId
        },
        updateData,
        {
          new: true
        }
      );

      return this.sendJSONResponse(
        res,
        "data updated",
        {
          length: 1
        },
        updatedData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  //admin allow/deny
  async allowAgency(req, res) {
    try {
      const id = req.query._id;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData);
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      // const tokenData = req.userData;

      // const adminData = await adminSchema.find({ _id: tokenData.id });

      // if (adminData.length === 0) {
      //   throw new Forbidden("you are not admin");
      // }
      const updateData = {
        status: req.body.status,
        // password: 'demo123',
        status_change_by: tokenData.id
      };

      const message = "your syt account is allowed. you can use now. your password is " + updateData.password;

      const updatedData = await agencySchema.updateOne({ user_id: id }, updateData, { new: true });

      for (let i = 0; i < updatedData.length; i++) {
        const element = updatedData[0];
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
                body: `Added New Customrequirement`
              },
              data: {
                title: "Notification",
                body: `Added New Customrequirement`,
                message: "Message"
              }
            },
            element?.email_address
          );
        }
      }
      // transporter.sendMail(
      //     mailOptions(updateData.email_address, message),
      //     function (error, info) {
      //       if (error) {
      //         console.log(error); // throw error;
      //       }
      // });
      return this.sendJSONResponse(
        res,
        "agency is alloweded",
        {
          length: 1
        },
        updatedData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async deleteAgency(req, res) {
    try {
      const userData = req.userData;
      const id = req.params.id;
      const data1 = {
        status: "delete",
        status_change_by: userData.id
      };
      const updatedData = await agencySchema.findByIdAndDelete({ _id: id }, data1);
      return this.sendJSONResponse(
        res,
        "agency deleted",
        {
          length: 1
        },
        updatedData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async Agency_forgot_Password(req, res) {
    try {
      const data = {
        phone: req.body.mobile_number,
        role: "agency"
      };
      const findnumber = await userSchema.findOne(data);
      // const userData = await userSchema.findById({_id: tokenData.id});
      console.log(findnumber);
      // if(findnumber.mobile_number !== 0){
      //     console.log("123");

      const hashedPassword = await bcrypt.hash(req.body.newpassword, 10);

      const updatedData = await userSchema.findOneAndUpdate(
        { phone: req.body.mobile_number, role: "agency" },
        { password: hashedPassword }
      );
      // console.log(updatedData);
      // }

      //

      // const updatedUser = await userSchema.findById({_id: tokenData.id});

      return this.sendJSONResponse(
        res,
        "Password Changed Successfully",
        {
          length: 1
        },
        updatedData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async agency_change_Password(req, res) {
    try {
      const tokenData = req.userData;
      console.log(tokenData);
      const data = {
        _id: tokenData.id,
        old_password: req.body.old_password,
        new_password: req.body.new_password
      };
      console.log(data);
      const agencyData = await userSchema.find({ _id: data._id });
      console.log(agencyData);
      if (!agencyData?.length) {
        throw new Error("No User Found");
      }

      const isPasswordValid = await bcrypt.compare(data.old_password, agencyData[0].password);
      if (!isPasswordValid) {
        throw new Forbidden("Old password does not match");
      }
      // if (agencyData[0].password !== data.old_password) {
      //   throw new Forbidden("old password does not match");
      // }

      const hashedNewPassword = await bcrypt.hash(data.new_password, 10);

      const updatedData = await userSchema.findByIdAndUpdate(
        { _id: data._id },
        { password: hashedNewPassword },
        { new: true }
      );

      let agencyInfo = await agencySchema.findOne({ user_id: data._id });

      let notificationForAgency = await Notificationschema.create({
        user_id: tokenData.id,
        title: "Password Successfully Changed",
        text: `Hi ${agencyInfo.full_name}, your password has been successfully updated.`,
        user_type: "agency"
      });

      const adminSocketId = getReceiverSocketId(data._id);
      console.log("change password socket::", adminSocketId);
      if (adminSocketId) {
        io.to(adminSocketId).emit("newNotification", notificationForAgency);
      }

      return this.sendJSONResponse(
        res,
        "password changed",
        {
          length: 1
        },
        updatedData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async Agency_Dashboard(req, res) {
  //   try {
  //     const tokenData = req.userData;
  //     if (tokenData === "") {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }
  //     const userData = await userSchema.find({ _id: tokenData.id });
  //     if (userData[0].role !== "agency") {
  //       throw new Forbidden("you are not agency");
  //     }

  //     // const supplier_payment_released = await supplier_payment_Schema.count({
  //     //   agency_id: tokenData.id,
  //     //   status: "paid",

  //     // });
  //     const supplier_payment_released = await supplier_payment_Schema.aggregate([
  //       {
  //         $match: { agency_id: mongoose.Types.ObjectId(tokenData.id), status: "paid" }
  //       },
  //       {
  //         $group: {
  //           _id: null,
  //           paid_amount: { $sum: "$paid_amount" }
  //         }
  //       }
  //     ]);

  //     const supplier_payment_overdue = await supplier_payment_Schema.count({
  //       agency_id: tokenData.id,
  //       status: "overdue"
  //     });
  //     const supplier_payment_due = await supplier_payment_Schema.count({ agency_id: tokenData.id, status: "due" });

  //     const leads_assigned = await lead_schema.count({ agency_id: tokenData.id, status: "assigned" });
  //     const leads_fresh = await lead_schema.count({ agency_id: tokenData.id, status: "fresh" });
  //     const leads_followups = await lead_schema.count({ agency_id: tokenData.id, status: "followups" });

  //     const opportunity_followups = await lead_schema.count({ agency_id: tokenData.id, status: "opportunity" });
  //     const opportunity_pipeline = await lead_schema.count({ agency_id: tokenData.id, status: "opportunity" });
  //     const bookings_followups = await lead_schema.count({ agency_id: tokenData.id, status: "booking" });

  //     const invoice_reminder = await invoice_schema.count({ agency_id: tokenData.id, status: "assigned" });
  //     const invoice_overdue = await invoice_schema.count({ agency_id: tokenData.id, status: "overdue" });
  //     const invoice_paid = await invoice_schema.count({ agency_id: tokenData.id, status: "paid" });
  //     const invoice_due = await invoice_schema.count({ agency_id: tokenData.id, status: "due" });

  //     const result = [
  //       //money : supplier_payments table ma : status==="paid" , sum:paid_amount
  //       { icon: "fa fa-map-o", name: "Supplier Payment (Released)", value: supplier_payment_released },
  //       //money : supplier_payments table ma : status==="overdue" , sum:pending_amount
  //       { icon: "fa fa-money", name: "Supplier Payment (OverDue)", value: supplier_payment_overdue },
  //       //money : supplier_payments table ma : status==="draft" , sum:pending_amount
  //       { icon: "fa fa-edit", name: "Supplier Payment (Due)", value: supplier_payment_due },
  //       // count : $match{allocated_to:{$exits:true}}
  //       { icon: "fa fa-money", name: "Leads (Assigned)", value: leads_assigned },
  //       // count : stage==="fresh"
  //       { icon: "fa fa-user", name: "Leads (Fresh)", value: leads_fresh },
  //       // count
  //       { icon: "fa fa-cube", name: "Leads (Followups)", value: leads_followups },
  //       // count : stage==="opportunity",
  //       { icon: "fa fa-user-circle-o", name: "Opportunity (Followups)", value: opportunity_followups },
  //       // money : stage==="opportunity", sum:budget field
  //       { icon: "fa fa-money", name: "Opportunity (Pipeline)", value: opportunity_pipeline },
  //       // count : stage==="bookings",
  //       { icon: "fa fa-book", name: "Booking (Followups)", value: bookings_followups },
  //       // count : reminders table ma : {$match:{status:"scheduled",invoice_id:{$exits:true}}}
  //       { icon: "fa fa-bell", name: "Invoice (Reminder)", value: invoice_reminder },
  //       // money : invoices table ma : status==="overdue",sum:net_amount
  //       { icon: "fa fa-money", name: "Invoice (Overdue)", value: invoice_overdue },
  //       // money : invoices table ma : status==="paid",sum:received_amount
  //       { icon: "fa fa-address-book", name: "Invoice (Paid)", value: invoice_paid },
  //       // money : invoices table ma : status==="draft",sum:net_amount
  //       { icon: "fa fa-rupee", name: "Invoice (Due)", value: invoice_due }
  //     ];

  //     return this.sendJSONResponse(
  //       res,
  //       "dashboard data returned",
  //       {
  //         length: 1
  //       },
  //       result
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async Agency_Dashboard(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }

      const userData = await userSchema.findById(tokenData.id);
      if (userData.role !== "agency") {
        throw new Forbidden("You are not authorized as an agency");
      }

      const totalReadyPackage = await packageSchema.countDocuments({ user_id: tokenData.id });

      const now = new Date(); // Current date
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

      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const currentMonth = now.getMonth() + 1;

      const totalBookedPackageCount = await bookpackageschema.aggregate([
        {
          $match: { status: "booked" }
        },
        {
          $lookup: {
            from: "packages",
            localField: "package_id",
            foreignField: "_id",
            as: "package"
          }
        },
        {
          $unwind: "$package" // Unwind to access fields of the package
        },
        {
          $match: {
            "package.user_id": new mongoose.Types.ObjectId(tokenData.id)
          }
        },
        {
          $addFields: {
            approx_start_date: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ["$approx_start_date", null] },
                    { $ne: ["$approx_start_date", ""] },
                    { $regexMatch: { input: "$approx_start_date", regex: /^\d{4}-\d{2}-\d{2}$/ } }
                  ]
                },
                then: { $dateFromString: { dateString: "$approx_start_date" } },
                else: null
              }
            },
            approx_end_date: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ["$approx_end_date", null] },
                    { $ne: ["$approx_end_date", ""] },
                    { $regexMatch: { input: "$approx_end_date", regex: /^\d{4}-\d{2}-\d{2}$/ } }
                  ]
                },
                then: { $dateFromString: { dateString: "$approx_end_date" } },
                else: null
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            totalBookedPackageCount: { $sum: 1 },
            ongoingTripsCount: {
              $sum: {
                $cond: [
                  {
                    $and: [{ $lte: ["$approx_start_date", now] }, { $gte: ["$approx_end_date", now] }]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      const totalBidBookedPackageCount = await bookpackageschema.aggregate([
        {
          $match: { status: "booked" }
        },
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bid"
          }
        },
        {
          $unwind: "$bid" // Unwind to access fields of the bid package
        },
        {
          $match: {
            "bid.agency_id": new mongoose.Types.ObjectId(tokenData.id)
          }
        },
        {
          $addFields: {
            approx_start_date: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ["$approx_start_date", null] },
                    { $ne: ["$approx_start_date", ""] },
                    { $regexMatch: { input: "$approx_start_date", regex: /^\d{4}-\d{2}-\d{2}$/ } }
                  ]
                },
                then: { $dateFromString: { dateString: "$approx_start_date" } },
                else: null
              }
            },
            approx_end_date: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ["$approx_end_date", null] },
                    { $ne: ["$approx_end_date", ""] },
                    { $regexMatch: { input: "$approx_end_date", regex: /^\d{4}-\d{2}-\d{2}$/ } }
                  ]
                },
                then: { $dateFromString: { dateString: "$approx_end_date" } },
                else: null
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            totalBookedPackageCount: { $sum: 1 },
            ongoingTripsCount: {
              $sum: {
                $cond: [
                  {
                    $and: [{ $lte: ["$approx_start_date", now] }, { $gte: ["$approx_end_date", now] }]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      // Combine the results
      const combinedResult = {
        totalBookedPackageCount:
          (totalBookedPackageCount[0]?.totalBookedPackageCount || 0) +
          (totalBidBookedPackageCount[0]?.totalBookedPackageCount || 0),
        ongoingTripsCount:
          (totalBookedPackageCount[0]?.ongoingTripsCount || 0) + (totalBidBookedPackageCount[0]?.ongoingTripsCount || 0)
      };

      const totalBookedPackage = await bookpackageschema.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
            status: "booked"
          }
        },
        {
          $lookup: {
            from: "packages",
            localField: "package_id",
            foreignField: "_id",
            as: "package"
          }
        },
        {
          $unwind: "$package" // Unwind to access fields of the package
        },
        {
          $match: {
            "package.user_id": new mongoose.Types.ObjectId(tokenData.id)
          }
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            booking: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $project: {
            month: "$_id",
            booking: 1,
            _id: 0
          }
        }
      ]);

      const totalBidBookedPackage = await bookpackageschema.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
            status: "booked"
          }
        },
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bid"
          }
        },
        {
          $unwind: "$bid" // Unwind to access fields of the bid package
        },
        {
          $match: {
            "bid.agency_id": new mongoose.Types.ObjectId(tokenData.id)
            // 'bid.createdAt': { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            booking: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $project: {
            month: "$_id",
            booking: 1,
            _id: 0
          }
        }
      ]);

      const bookingDate = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.getMonth() + 1; // Get month number (1-12)
        bookingDate.push({
          month: monthNames[month - 1],
          package: 0,
          bid: 0
        });
      }

      // Merge the actual commercial inquiry data with the default array
      totalBookedPackage.forEach((data) => {
        const index = bookingDate.findIndex((item) => item.month === monthNames[data.month - 1]);
        if (index !== -1) {
          bookingDate[index].package = data.booking;
        }
      });

      // Merge the actual sample inquiry data with the default array
      totalBidBookedPackage.forEach((data) => {
        const index = bookingDate.findIndex((item) => item.month === monthNames[data.month - 1]);
        if (index !== -1) {
          bookingDate[index].bid = data.booking;
        }
      });

      const monthlySumbidtedBid = await Bidschema.aggregate([
        {
          $match: {
            bid_status: "submit",
            agency_id: new mongoose.Types.ObjectId(tokenData.id),
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            bidStatus: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $project: {
            month: "$_id",
            bidStatus: 1,
            _id: 0
          }
        }
      ]);

      // Aggregate sample inquiries by month, limited to the last 6 months
      const monthlyRejectedBid = await Bidschema.aggregate([
        {
          $match: {
            bid_status: "reject",
            agency_id: new mongoose.Types.ObjectId(tokenData.id),
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            bidStatus: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $project: {
            month: "$_id",
            bidStatus: 1,
            _id: 0
          }
        }
      ]);

      // Create an array for the last 6 months with default inquiries count 0
      const bidStatusData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = date.getMonth() + 1; // Get month number (1-12)
        bidStatusData.push({
          month: monthNames[month - 1],
          accepted: 0,
          rejected: 0
        });
      }

      // Merge the actual commercial inquiry data with the default array
      monthlySumbidtedBid.forEach((data) => {
        const index = bidStatusData.findIndex((item) => item.month === monthNames[data.month - 1]);
        if (index !== -1) {
          bidStatusData[index].accepted = data.bidStatus;
        }
      });

      // Merge the actual sample inquiry data with the default array
      monthlyRejectedBid.forEach((data) => {
        const index = bidStatusData.findIndex((item) => item.month === monthNames[data.month - 1]);
        if (index !== -1) {
          bidStatusData[index].rejected = data.bidStatus;
        }
      });

      // Calculate total travelers and total revenue
      const revenuePackageData = await bookpackageschema.aggregate([
        {
          $match: { status: "booked" }
        },
        {
          $lookup: {
            from: "packages",
            localField: "package_id",
            foreignField: "_id",
            as: "package"
          }
        },
        {
          $unwind: "$package" // Unwind to access fields of the package
        },
        {
          $match: {
            "package.user_id": new mongoose.Types.ObjectId(tokenData.id)
          }
        }
      ]);

      const revenueBidData = await bookpackageschema.aggregate([
        {
          $match: { status: "booked" }
        },
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bid"
          }
        },
        {
          $unwind: "$bid" // Unwind to access fields of the package
        },
        {
          $match: {
            "bid.agency_id": new mongoose.Types.ObjectId(tokenData.id)
          }
        }
      ]);

      const combinedData = [...revenuePackageData, ...revenueBidData];

      // Initialize variables for total travelers and revenue
      let totalTravelers = 0;
      let totalRevenue = 0;

      // Loop through the combined data and calculate total travelers and revenue
      combinedData.forEach((item) => {
        // Total travelers (adults, children, infants)
        totalTravelers += (item.total_adult || 0) + (item.total_child || 0) + (item.total_infant || 0);

        // Sum up paid amounts from payments array
        if (item.payment && item.payment.length > 0) {
          item.payment.forEach((payment) => {
            totalRevenue += payment.paid_amount || 0;
          });
        }
      });

      const mostLovedDestination = await destinationSchema.countDocuments();

      const totalSubmittedBid = await Bidschema.countDocuments({
        agency_id: tokenData.id,
        bid_status: "submit"
      });

      const totalAcceptedBid = await Bidschema.countDocuments({
        agency_id: tokenData.id,
        bid_status: "save"
      });

      const totalRejectedBid = await Bidschema.countDocuments({
        agency_id: tokenData.id,
        bid_status: "reject"
      });

      // const top5Booking = await bookpackageschema.find().limit(5)
      const top5Booking = await bookpackageschema.aggregate([
        {
          $match: { status: "booked" }
        },
        {
          $lookup: {
            from: "packages",
            localField: "package_id",
            foreignField: "_id",
            as: "package"
          }
        },
        {
          $match: {
            "package.user_id": mongoose.Types.ObjectId(tokenData.id)
          }
        },
        {
          $unset: "package"
        }
        // {
        //   $project: {
        //     _id: 1,
        //     departure: 1,
        //     destination: 1,
        //     contact_number:1,

        //   }
        // }
      ]);

      const bidPackageDetails = await bookpackageschema.aggregate([
        {
          $match: { status: "booked" }
        },
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bid"
          }
        },
        {
          $match: {
            "bid.agency_id": new mongoose.Types.ObjectId(tokenData.id)
          }
        },
        {
          $unset: "bid"
        }
        // {
        //   $project: {
        //     _id: 1,
        //     departure: 1,
        //     destination: 1,
        //     contact_number:1,

        //   }
        // }
      ]);

      let combinedResults = [...top5Booking, ...bidPackageDetails];

      // Sort combined results by a common date field (e.g., createdAt)
      combinedResults.sort((a, b) => b.top5Booking - a.bidPackageDetails);

      // Limit to top 5 results
      const top5Combined = combinedResults.reverse().slice(0, 5);

      const topStates = await customerequirementSchema.aggregate([
        {
          $lookup: {
            from: "book_packages",
            localField: "_id",
            foreignField: "custom_package_id",
            as: "bookingDetails"
          }
        },
        {
          $unwind: {
            path: "$bookingDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: "$state", // Group by state
            uniquePackages: { $addToSet: "$bookingDetails.custom_package_id" } // Collect unique package IDs
          }
        },
        {
          $project: {
            bookings: { $size: "$uniquePackages" } // Count the number of unique package IDs
          }
        },
        {
          $sort: { bookings: -1 } // Sort by number of bookings in descending order
        },
        {
          $limit: 6 // Limit to top 6 states
        }
      ]);

      // Format topStates for response
      const formattedTopStates = topStates.map((state) => ({
        state: state._id,
        bookings: state.bookings,
        outOf: 50
      }));

      const myHotels = await hotel_model.countDocuments({ user_id: tokenData.id });

      const totalHotelBooking = await hotel_booking_syt_Schema.aggregate([
        {
          $match: {
            status: { $in: ["booked", "approve"] }
          }
        },
        {
          $lookup: {
            from: "hotel_syts",
            localField: "hotel_id",
            foreignField: "_id",
            as: "hotel_details"
          }
        },
        {
          $match: {
            "hotel_details.user_id": new mongoose.Types.ObjectId(tokenData.id)
          }
        },
        {
          $count: "hoteltotalBookings" // Count the number of matching car bookings
        }
      ]);

      const hotelbookingCount = totalHotelBooking.length > 0 ? totalHotelBooking[0].hoteltotalBookings : 0;

      const totalCarBooking = await CarBooking.aggregate([
        {
          $match: {
            status: "booked"
          }
        },
        {
          $lookup: {
            from: "vendorcars", // Lookup in the vendorcars collection
            localField: "vendor_car_id", // Field in CarBooking collection
            foreignField: "_id", // Field in vendorcars collection
            as: "car" // Alias for the result
          }
        },
        {
          $match: {
            "car.vendor_id": new mongoose.Types.ObjectId(tokenData.id) // Filter for vendor's car bookings
          }
        },
        {
          $count: "totalBookings" // Count the number of matching car bookings
        }
      ]);

      const bookingCount = totalCarBooking.length > 0 ? totalCarBooking[0].totalBookings : 0;

      const display_agencys_all_review = await Bidschema.aggregate([
        {
          $match: { agency_id: mongoose.Types.ObjectId(tokenData.id) }
        },
        {
          $lookup: {
            from: "book_packages",
            localField: "_id",
            foreignField: "bid_package_id",
            as: "book_package",
            pipeline: [
              {
                $lookup: {
                  from: "reviews",
                  localField: "_id",
                  foreignField: "book_package_id",
                  as: "review",
                  pipeline: [
                    {
                      $lookup: {
                        from: "customers",
                        localField: "user_id",
                        foreignField: "user_id",
                        as: "customer"
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          $unwind: "$book_package"
        },
        {
          $unwind: "$book_package.review"
        },
        {
          $group: {
            _id: "$_id",
            agency_id: { $first: "$agency_id" },
            book_package: { $push: "$book_package" },
            average_star: { $avg: { $toDouble: "$book_package.review.star" } },
            total_reviews: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 1,
            agency_id: 1,
            departure: 1,
            destination: 1,
            book_package: {
              _id: 1,
              review: {
                _id: 1,
                user_id: 1,
                star: 1,
                comment_box: 1,
                customer: {
                  _id: 1,
                  name: 1,
                  photo: 1
                }
              }
            },
            average_star: 1,
            total_reviews: 1
          }
        }
      ]);

      const display_agencys_all_review_package = await packageSchema.aggregate([
        {
          $match: { user_id: mongoose.Types.ObjectId(tokenData.id) }
        },
        {
          $lookup: {
            from: "book_packages",
            localField: "_id",
            foreignField: "package_id",
            as: "book_package",
            pipeline: [
              {
                $lookup: {
                  from: "reviews",
                  localField: "_id",
                  foreignField: "book_package_id",
                  as: "review",
                  pipeline: [
                    {
                      $lookup: {
                        from: "customers",
                        localField: "user_id",
                        foreignField: "user_id",
                        as: "customer"
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          $unwind: "$book_package"
        },
        {
          $unwind: "$book_package.review"
        },
        {
          $group: {
            _id: "$_id",
            agency_id: { $first: "$user_id" },
            book_package: { $push: "$book_package" },
            average_star: { $avg: { $toDouble: "$book_package.review.star" } },
            total_reviews: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 1,
            agency_id: 1,
            departure: 1,
            destination: 1,
            book_package: {
              _id: 1,
              review: {
                _id: 1,
                user_id: 1,
                star: 1,
                comment_box: 1,
                customer: {
                  _id: 1,
                  name: 1,
                  photo: 1
                }
              }
            },
            average_star: 1,
            total_reviews: 1
          }
        }
      ]);

      const combinedReviewData = [...display_agencys_all_review, ...display_agencys_all_review_package];

      // Initialize variables to calculate total reviews and total stars
      let totalStars = 0;
      let totalReviews = 0;

      // Iterate through combined data and calculate total stars and reviews
      combinedReviewData.forEach((entry) => {
        totalStars += entry.average_star * entry.total_reviews; // Sum of stars
        totalReviews += entry.total_reviews; // Sum of reviews
      });

      // Calculate the average star rating
      const averageStarRating = Number(totalReviews > 0 ? (totalStars / totalReviews).toFixed(2) : 0);

      // Calculate the average star rating
      // let totalStars = 0;
      // let totalReviews = 0;

      // // Iterate through each entry in the response
      // for (const entry of display_agencys_all_review) {
      //   // Add the stars of each review to the totalStars
      //   totalStars += entry.average_star * entry.total_reviews;
      //   // Add the total number of reviews to the totalReviews
      //   totalReviews += entry.total_reviews;
      // }

      // // Calculate the average star rating
      // const averageStarRating = totalStars / totalReviews;
      // const totalReview = totalReviews;

      const result = {
        totalReadyPackage: totalReadyPackage,
        bookingDate,
        bidStatusData,
        totalBooking: combinedResult.totalBookedPackageCount,
        totalOngoingTrips: combinedResult.ongoingTripsCount,
        totalSubmittedBid: totalSubmittedBid,
        totalAcceptedBid: totalAcceptedBid,
        totalRejectedBid: totalRejectedBid,
        totalTravelers: totalTravelers, // Adding total travelers
        totalRevenue: totalRevenue, // Adding total revenue
        mostLovedDestination: mostLovedDestination,
        top5Booking: top5Combined,
        topStates: formattedTopStates,
        totalHotels: myHotels,
        totalHotelBooking: hotelbookingCount,
        totalCarBooking: bookingCount,
        totalReview: totalReviews,
        averageRating: averageStarRating
      };

      return this.sendJSONResponse(res, "Agency dashboard returned", { length: 1 }, result);
    } catch (error) {
      return this.sendErrorResponse(req, res, error);
    }
  }

  async send_otp(req, res) {
    const { contact } = req.body;

    // Validate the contact number
    if (!contact || contact.length !== 10 || isNaN(contact)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const number = `+91${contact}`;
    const randomOtp = Math.floor(Math.random() * 900000) + 100000; // Generate a 6-digit OTP
    const smsUrl = `https://rslri.connectbind.com:8443/bulksms/bulksms?username=DG35-webearl&password=digimile&type=0&dlr=1&destination=${number}&source=WEBEAR&message=Dear User, Your one time password is ${randomOtp} and it is valid for 10 minutes. Do not share it to anyone. Thank you, Team WEBEARL TECHNOLOGIES.&entityid=1101602010000073269&tempid=1107169899584811565`;

    try {
      const response = await axios.get(smsUrl);

      if (response.status === 200) {
        // Save the OTP in the database
        await Otp.findOneAndUpdate(
          { contact: contact }, // Find document by contact
          { $set: { otp: randomOtp } }, // Update the OTP value
          { upsert: true, new: true } // If not found, insert new document, and return the new document
        );

        return res.status(200).json({ contact: contact, message: "OTP sent and saved successfully", otp: randomOtp });
      } else {
        return res.status(500).json({ message: "Failed to send OTP" });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      return res.status(500).json({ message: "Error sending OTP", error });
    }
  }

  async verify_otp(req, res) {
    try {
      let { otp, contact } = req.body;
      let otpData = await Otp.findOne({ contact });
      if (!otpData) {
        return res.status(400).json({ succuss: false, message: "User not found!" });
      }

      if (otp !== otpData.otp) {
        return res.status(400).json({ succuss: false, message: "invalid otp" });
      } else {
        await Otp.findOneAndUpdate({ contact: contact }, { $set: { otp: null } });
        return res.status(200).json({ succuss: true, message: "otp verify succussfully" });
      }
    } catch (error) {
      return res.status(500).json({ succuss: false, message: error.message });
    }
  }
};
