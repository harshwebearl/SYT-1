const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const agencySchema = require("../models/Agency_personalSchema");
const Bidschema = require("../models/bidSchema");
const niv = require("node-input-validator");
const NotFound = require("../errors/NotFound");
const mongoose = require("mongoose");
const sendNotification = require("../config/firebase/firebaseAdmin");
const UserSchema = require("../models/customerSchema");
const customRequirementSchema = require("../models/custom_requirementsSchema");
const { generateFileDownloadLinkPrefix } = require("../utils/utility");
const userSchema = require("../models/usersSchema");
const image_url = require("../update_url_path.js");
const fn = "itinary";
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const package_profit_margin = require("../models/package_profit_margin.js");
const { pipeline } = require("nodemailer/lib/xoauth2/index.js");
const { getReceiverSocketId, io } = require("../socket/socket.js");
const Notificationschema = require("../models/NotificationSchema.js");
const packageSchema = require("../models/PackageSchema.js");

module.exports = class BidPackage extends BaseController {
  async addBidPackage(req, res) {
    try {
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

      const display_biddata = await Bidschema.find({
        $and: [{ agency_id: tokenData.id }, { custom_requirement_id: req.body.custom_requirement_id }]
      });

      if (display_biddata.length === 0) {
        const customRequirementResult = await customRequirementSchema.findById(req.body.custom_requirement_id);

        let hotel_types = req.body.hotel_types;
        if (Array.isArray(hotel_types)) {
          hotel_types = hotel_types.sort();
        }

        // if (!req.body.name || req.body.name.trim() === "") {
        //   throw new Forbidden("Package name is required.");
        // }
        // if (!req.body.total_days || typeof req.body.total_days !== "number") {
        //   throw new Forbidden("Total days is required and must be a number.");
        // }
        // if (!req.body.total_nights || typeof req.body.total_nights !== "number") {
        //   throw new Forbidden("Total nights is required and must be a number.");
        // }
        // if (!req.body.travel_by || req.body.travel_by.trim() === "") {
        //   throw new Forbidden("Travel by is required.");
        // }

        // if (!req.body.hotel_types || req.body.hotel_types.trim() === "") {
        //   throw new Forbidden("Hotel Types by is required.");
        // }

        // // if (!req.body.meal_types || req.body.meal_types.trim() === "") {
        // //   throw new Forbidden("Meal type is required.");
        // // }

        // if (!req.body.total_amount || typeof req.body.total_amount !== "number") {
        //   throw new Forbidden("Total amount is required and must be a number.");
        // }
        // if (!req.body.room_sharing || req.body.room_sharing.trim() === "") {
        //   throw new Forbidden("Room sharing option is required.");
        // }
        // if (!req.body.package_type || req.body.package_type.trim() === "") {
        //   throw new Forbidden("Package type is required.");
        // }
        let date = new Date();

        const insertData = {
          agency_id: tokenData.id,
          custom_requirement_id: `${customRequirementResult._id}`,
          bid_date: new Date(),
          name: req.body.name,
          departure: customRequirementResult.departure,
          destination: customRequirementResult.destination,
          total_adult: customRequirementResult.total_adult,
          total_child: customRequirementResult.total_child,
          Infant: customRequirementResult.Infant,
          total_days: req.body.total_days,
          total_nights: req.body.total_nights,
          travel_by: req.body.travel_by,
          hotel_types: hotel_types,
          meal_required: req.body.meal_required,
          meal_types: req.body.meal_types,
          other_services_by_agency: req.body.other_services_by_agency,
          // other_details: req.body.other_details,
          sightseeing: req.body.sightseeing,
          start_date: date,
          end_date: req.body.end_date,
          include_services: req.body.include_services,
          exclude_services: req.body.exclude_services,
          destination_category: customRequirementResult.category,
          additional_requirement: customRequirementResult.additional_requirement?.[0] || "",
          total_amount: req.body.total_amount,
          personal_care: req.body.personal_care,
          price_per_person_child: req.body.price_per_person_child,
          price_per_person_adult: req.body.price_per_person_adult,
          price_per_person_infant: req.body.price_per_person_infant,
          room_sharing: req.body.room_sharing,
          package_type: req.body.package_type,
          package_valid_till_for_booking: req.body.package_valid_till_for_booking,
          admin_margin_price: req.body.admin_margin_price,
          admin_margin: req.body.admin_margin,
          lunch_price: req.body.lunch_price,
          dinner_price: req.body.dinner_price,
          breakfast_price: req.body.breakfast_price
        };

        const bidData = await Bidschema.find({
          agency_id: tokenData.id,
          custom_requirement_id: insertData.custom_requirement_id
        });

        if (bidData.length !== 0) {
          throw new Forbidden("you are not more then one bid for this requirements");
        }
        const bidInsertData = new Bidschema(insertData);
        const result = await bidInsertData.save();

        this.sendJSONResponse(
          res,
          "bidPackage of custom_requirement is added",
          {
            length: 1
          },
          result
        );
      } else {
        this.sendJSONResponse(
          res,
          "bidPackage of custom_requirement is display",
          {
            length: 1
          },
          display_biddata
        );
      }
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async displayUserBidPackage(req, res) {
  //   try {
  //     const tokenData = req.userData;
  //     const id = req.query.custom_requirement_id;
  //     const bidPackageData = await Bidschema.aggregate([
  //       {
  //         $match: {
  //           $and: [{ bid_status: "submit" }, { custom_requirement_id: mongoose.Types.ObjectId(id) }]
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "custom_requirements",
  //           localField: "custom_requirement_id",
  //           foreignField: "_id",
  //           as: "Custom_Requirement",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "destinations",
  //                 localField: "destination",
  //                 foreignField: "_id",
  //                 as: "Destination"
  //               }
  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "agencypersonals",
  //           localField: "agency_id",
  //           foreignField: "user_id",
  //           as: "Agency"
  //         }
  //       },
  //       {
  //         $project: {
  //           price_per_person: 1,
  //           bid_date: 1,

  //           bid_date1: { $dateToString: { format: "%d/%m/%Y", date: "$bid_date" } },
  //           Agency: {
  //             agency_name: 1
  //           }
  //         }
  //       }
  //     ]);
  //     const final_data = [];
  //     bidPackageData.forEach((element) => {
  //       final_data.push({
  //         _id: element._id,
  //         Price: element.price_per_person,
  //         Date: element.bid_date1,
  //         Agency: element.Agency[0].agency_name
  //         //
  //       });
  //     });
  //     return this.sendJSONResponse(
  //       res,
  //       "bid package",
  //       {
  //         length: 1
  //       },
  //       final_data
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async displayUserBidPackage(req, res) {
    try {
      const tokenData = req.userData;
      const id = req.query.custom_requirement_id;
      const bidPackageData = await Bidschema.aggregate([
        // {
        //   $match: {
        //     $and: [{ bid_status: "submit" }, { custom_requirement_id: mongoose.Types.ObjectId(id) }]
        //   }
        // },
        {
          $match: {
            $and: [
              { bid_status: { $in: ["submit", "booked", "booked another package", "reject"] } },
              { custom_requirement_id: new mongoose.Types.ObjectId(id) }
            ]
          }
        },
        {
          $lookup: {
            from: "custom_requirements",
            localField: "custom_requirement_id",
            foreignField: "_id",
            as: "Custom_Requirement",
            pipeline: [
              {
                $lookup: {
                  from: "destinations",
                  localField: "destination",
                  foreignField: "_id",
                  as: "Destination"
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "agencypersonals",
            localField: "agency_id",
            foreignField: "user_id",
            as: "Agency"
          }
        },
        {
          $project: {
            destination: 1,
            price_per_person_infant: 1,
            price_per_person_child: 1,
            price_per_person_adult: 1,
            total_adult: 1,
            total_child: 1,
            total_infant: 1,
            total_amount: 1,
            price_per_person: 1,
            bid_date: 1,
            bid_status: 1,
            breakfast_price: 1,
            lunch_price: 1,
            dinner_price: 1,
            bid_date1: { $dateToString: { format: "%d/%m/%Y", date: "$bid_date" } },
            Agency: {
              agency_name: 1
            }
          }
        }
      ]);

      const packageProfitMargin = await package_profit_margin.find();

      const final_data = [];
      bidPackageData.forEach((element) => {
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

        const [day, month, year] = element.bid_date1.split("/").map(Number);
        const startDateObject = new Date(year, month - 1, day);
        const currentMonth = monthNames[startDateObject.getMonth()]; // Get the month name
        // console.log(currentMonth);

        const userAdminMargin = packageProfitMargin.find(
          (margin) => margin.state_name.toLowerCase() === element.destination.toLowerCase()
        );

        let marginPercentage = 10; // Default margin (10%)

        // If a matching margin is found, use it
        if (userAdminMargin) {
          const relevantUserMargin = userAdminMargin.month_and_margin_user.find((m) => m.month_name === currentMonth);
          if (relevantUserMargin) {
            marginPercentage = parseFloat(relevantUserMargin.margin_percentage);
          }
        }

        const applyMargin = (price) => {
          return price + (price * marginPercentage) / 100;
        };

        const pricePerPersonAdultWithMargin = applyMargin(parseFloat(element.price_per_person_adult || 0));
        const pricePerPersonChildWithMargin = applyMargin(parseFloat(element.price_per_person_child || 0));
        const pricePerPersonInfantWithMargin = applyMargin(parseFloat(element.price_per_person_infant || 0));
        const totalAmountWithMargin = applyMargin(parseFloat(element.total_amount || 0));

        final_data.push({
          _id: element._id,
          Price: element.price_per_person,
          destination: element.destination,
          total_adult: element.total_adult,
          total_child: element.total_child,
          total_infant: element.Infant,
          price_per_person_adult: pricePerPersonAdultWithMargin,
          price_per_person_child: pricePerPersonChildWithMargin,
          price_per_person_infant: pricePerPersonInfantWithMargin,
          total_amount: totalAmountWithMargin,
          breakfast_price: element.breakfast_price,
          lunch_price: element.lunch_price,
          dinner_price: element.dinner_price,
          bid_status: element.bid_status,
          Date: element.bid_date1,
          Agency: element.Agency.length > 0 ? element.Agency[0].agency_name : "N/A",
          margin_percentage: marginPercentage,
          month_name: currentMonth
        });
      });

      return this.sendJSONResponse(
        res,
        "bid package",
        {
          length: final_data.length
        },
        final_data
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async update_bid_by_agency(req, res) {
  //   try {
  //     // const tokenData = req.userData;
  //     const _id = req.query.bid_id;
  //     // const agencyData = await agencySchema.find({ _id: tokenData.id });
  //     // if (agencyData.length === 0) {
  //     //   throw new Forbidden("you are not able to add this");
  //     // }
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

  //     const existingBid = await Bidschema.findOne({ agency_id: tokenData.id, _id: _id });
  //     if (!existingBid) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Bid not found"
  //       });
  //     }

  //     if (existingBid.bid_status === "submit") {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Cannot submit another bid"
  //       });
  //     }

  //     const insertdata = {
  //       price_per_person: req.body.price_per_person,
  //       total_days: req.body.total_days,
  //       travel_by: req.body.travel_by,
  //       departure: req.body.departure,
  //       destination: req.body.destination,
  //       total_adult: req.body.total_adult,
  //       total_child: req.body.total_child,
  //       Infant: req.body.Infant,
  //       hotel_types: req.body.hotel_types,
  //       meal_required: req.body.meal_required,
  //       meal_types: req.body.meal_types,
  //       other_services_by_agency: req.body.other_services_by_agency,
  //       other_details: req.body.other_details,
  //       sightseeing: req.body.sightseeing,
  //       start_date: req.body.start_date,
  //       end_date: req.body.end_date,
  //       include_services: req.body.include_services,
  //       exclude_services: req.body.exclude_services,
  //       destination_category: req.body.destination_category,
  //       total_amount: req.body.total_amount,
  //       additional_requirement: req.body.additional_requirement,
  //       bid_status: "submit",
  //       price_per_person_child: req.body.price_per_person_child,
  //       price_per_person_adult: req.body.price_per_person_adult,
  //       price_per_person_infant: req.body.price_per_person_infant,
  //       room_sharing: req.body.room_sharing
  //     };

  //     const bidInsertData = await Bidschema.updateOne({ agency_id: tokenData.id, _id: _id }, insertdata);

  //     const show_user = await Bidschema.aggregate([
  //       {
  //         $match: {
  //           _id: mongoose.Types.ObjectId(_id)
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "custom_requirements",
  //           localField: "custom_requirement_id",
  //           foreignField: "_id",
  //           as: "custom_requirement",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "users",
  //                 localField: "user_id",
  //                 foreignField: "_id",
  //                 as: "user"
  //               }
  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $project: {
  //           _id: 0,
  //           notificationTokens: 1,
  //           custom_requirement: {
  //             user: {
  //               _id: 1,
  //               notificationTokens: 1
  //             }
  //           }
  //         }
  //       }
  //     ]);

  //     //  console.log(11111111, show_user[0].custom_requirement[0].user[0]);

  //     for (let i = 0; i < show_user.length; i++) {
  //       const element = show_user[i].custom_requirement[0].user;
  //       // console.log(element);
  //       if (
  //         element?.notificationTokens &&
  //         element?.notificationTokens?.deviceType &&
  //         element?.notificationTokens?.deviceToken
  //       ) {
  //         sendNotification(
  //           element?.notificationTokens?.deviceType,
  //           element?.notificationTokens?.deviceToken,
  //           {
  //             notification: {
  //               title: "Notification",
  //               body: `Add bid package`
  //             },
  //             data: {
  //               title: "Notification",
  //               body: `Add bid package`,
  //               message: "Message"
  //             }
  //           },
  //           element?.email_address
  //         );
  //       }
  //     }

  //     this.sendJSONResponse(
  //       res,
  //       "bidPackage of custom_requirement is updated",
  //       {
  //         length: 1
  //       },
  //       bidInsertData
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async update_bid_by_agency(req, res) {
    try {
      const _id = req.query.bid_id;
      const tokenData = req.userData;

      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }

      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      const existingBid = await Bidschema.findOne({ agency_id: tokenData.id, _id: _id });
      if (!existingBid) {
        return res.status(404).json({
          success: false,
          message: "Bid not found"
        });
      }

      if (existingBid.bid_status === "submit") {
        return res.status(400).json({
          success: false,
          message: "Cannot submit another bid"
        });
      }

      const insertdata = {
        price_per_person: req.body.price_per_person,
        name: req.body.name,
        total_days: req.body.total_days,
        total_nights: req.body.total_nights,
        travel_by: req.body.travel_by,
        // departure: req.body.departure,
        // destination: req.body.destination,
        // total_adult: req.body.total_adult,
        // total_child: req.body.total_child,
        // Infant: req.body.Infant,
        hotel_types: req.body.hotel_types,
        meal_required: req.body.meal_required,
        meal_types: req.body.meal_types,
        other_services_by_agency: req.body.other_services_by_agency,
        other_details: req.body.other_details,
        sightseeing: req.body.sightseeing,
        start_date: req.body.start_date,
        package_type: req.body.package_type,
        end_date: req.body.end_date,
        // destination_category: req.body.destination_category,
        total_amount: req.body.total_amount,
        additional_requirement: req.body.additional_requirement,
        price_per_person_child: req.body.price_per_person_child,
        price_per_person_adult: req.body.price_per_person_adult,
        price_per_person_infant: req.body.price_per_person_infant,
        room_sharing: req.body.room_sharing,
        package_valid_till_for_booking: req.body.package_valid_till_for_booking,
        admin_margin_price: req.body.admin_margin_price,
        admin_margin: req.body.admin_margin,
        lunch_price: req.body.lunch_price,
        dinner_price: req.body.dinner_price,
        breakfast_price: req.body.breakfast_price
      };

      const bidInsertData = await Bidschema.updateOne({ agency_id: tokenData.id, _id: _id }, insertdata);

      const show_user = await Bidschema.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(_id)
          }
        },
        {
          $lookup: {
            from: "custom_requirements",
            localField: "custom_requirement_id",
            foreignField: "_id",
            as: "custom_requirement",
            pipeline: [
              {
                $lookup: {
                  from: "customers",
                  localField: "user_id",
                  foreignField: "user_id",
                  as: "user"
                }
              }
            ]
          }
        },
        {
          $project: {
            _id: 0,
            notificationTokens: 1,
            custom_requirement: {
              user: {
                _id: 1,
                notificationTokens: 1,
                email_address: 1 // Add email address here
              }
            }
          }
        }
      ]);

      for (let i = 0; i < show_user.length; i++) {
        const element = show_user[i].custom_requirement[0].user;

        // Send notification
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
                body: `Add bid package`
              },
              data: {
                title: "Notification",
                body: `Add bid package`,
                message: "Message"
              }
            },
            element?.email_address
          );
        }

        // let emailAddress = null;

        // if (show_user.length > 0) {
        //   const customRequirement = show_user[0].custom_requirement;
        //   if (customRequirement.length > 0) {
        //     const user = customRequirement[0].user;
        //     if (user.length > 0) {
        //       emailAddress = user[0].email_address;
        //     }
        //   }
        // }

        // console.log(emailAddress)
        // Send email notification
        //   if (emailAddress) {
        //     const msg = {
        //       to: emailAddress,
        //       from: {
        //         email: '57rakesh17@gmail.com',
        //         name: 'WebEarl Technologies Pvt Ltd.'
        //       },
        //       subject: 'Bid Submitted',
        //       text: `Hello, your bid with ID ${_id} has been successfully submitted.`,
        //       html: `<p>Hello,</p><p>Your bid with ID <strong>${_id}</strong> has been successfully submitted.</p>`,
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
        "bidPackage of custom_requirement is updated",
        {
          length: 1
        },
        bidInsertData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error);
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async updateServices(req, res) {
    try {
      const id = req.params.id;
      const tokenData = req.userData;

      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }

      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "agency") {
        throw new Forbidden("you are not agency");
      }

      const data = {
        include_services: req.body.include_services,
        exclude_services: req.body.exclude_services,
        bid_status: "submit",
        start_date: new Date()
      };

      const updatedData = await Bidschema.findByIdAndUpdate({ _id: id }, data, { new: true });

      let notificationDataForAgency = await Notificationschema.create({
        user_id: tokenData.id,
        title: "Bid Successfully Submitted!",
        text: `Hello, your bid for the travel requirement from ${updatedData.departure} to ${updatedData.destination} has been submitted successfully. We'll notify you when the customer responds.`,
        user_type: "agency"
      });

      const adminSocketId = getReceiverSocketId(tokenData.id);
      console.log("bid agency socket id::", adminSocketId);
      if (adminSocketId) {
        io.to(adminSocketId).emit("newNotification", notificationDataForAgency);
      }

      const customRequirementResult = await customRequirementSchema.findOne({ _id: updatedData.custom_requirement_id });

      let notificationDataForCustomer = await Notificationschema.create({
        user_id: customRequirementResult.user_id,
        title: "New Bid Received!",
        text: `Hello! A new bid has been received for your travel requirement from ${
          customRequirementResult.departure
        } to ${customRequirementResult.destination}. The package includes ${updatedData.total_days} days and ${
          updatedData.total_nights
        } nights, priced at ₹${
          updatedData.total_amount + updatedData.admin_margin_price
        }. Check your Requirement  to review the bid details.`,
        user_type: "customer"
      });

      const customeradminSocketId = getReceiverSocketId(customRequirementResult.user_id);
      console.log("bid customer socket id::", customeradminSocketId);
      if (customeradminSocketId) {
        io.to(customeradminSocketId).emit("newNotification", notificationDataForCustomer);
      }

      return this.sendJSONResponse(
        res,
        "update services in bid",
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

  async aproveRejectBid(req, res) {
    try {
      const id = req.params.id;
      const tokenData = req.userData;

      const bid_status = {
        bid_status: req.body.bid_status,
        status_change_by: tokenData.id
      };
      const updatedBidData = await Bidschema.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(id) }, bid_status);

      if (req.body.bid_status === "reject") {
        const agencyId = updatedBidData?.agency_id; // Assuming Bidschema contains agency_id

        // Fetch the custom requirement and user details
        const customRequirement = await customRequirementSchema.findById(updatedBidData?.custom_requirement_id);
        let user = await UserSchema.findOne({ user_id: tokenData.id });

        // Create a notification for the agency
        const notificationData = await Notificationschema.create({
          user_id: agencyId,
          title: "Bid Rejected",
          text: `Dear Agency, the user "${user.name}" has rejected your bid for the custom requirement "${customRequirement.departure} To ${customRequirement.destination}". Better luck next time!`,
          user_type: "agency"
        });

        // Send live notification via socket
        const agencySocketId = getReceiverSocketId(agencyId);
        if (agencySocketId) {
          io.to(agencySocketId).emit("newNotification", notificationData);
        }
      }

      return this.sendJSONResponse(
        res,
        "bid status updated",
        {
          length: 1
        },
        updatedBidData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  //for user
  async getbidData(req, res) {
    try {
      const bid_id = req.query.id;
      const id = req.query._id;

      if (!bid_id || `${bid_id}`.length !== 24) {
        console.log(`bid_id is empty ->${bid_id}`);
        throw new Error("bid_id is invalid");
        return;
      }

      const bidpackage = await Bidschema.aggregate([
        {
          $match: { $or: [{ _id: new mongoose.Types.ObjectId(bid_id) }, { _id: new mongoose.Types.ObjectId(id) }] }
        },
        {
          $lookup: {
            from: "itineries",
            localField: "_id",
            foreignField: "bid_id",
            as: "itineries"
          }
        },
        {
          $project: {
            _id: 1,
            agency_id: 1,
            custom_requirement_id: 1,
            price_per_person: 1,
            name: 1,
            bid_date: 1,
            total_days: 1,
            travel_by: 1,
            sightseeing: 1,
            hotel_types: 1,
            meal_required: 1,
            meal_types: 1,
            package_type: 1,
            other_services_by_agency: 1,
            personal_care: 1,
            start_date1: {
              $dateToString: { format: "%d/%m/%Y", date: "$start_date" }
            },
            end_date1: {
              $dateToString: { format: "%d/%m/%Y", date: "$end_date" }
            },
            destination_category: 1,
            exclude_services: 1,
            bid_status: 1,
            include_services: 1,
            itineries: 1,
            price_per_person_infant: 1,
            price_per_person_child: 1,
            price_per_person_adult: 1,
            room_sharing: 1,
            package_valid_till_for_booking: 1,
            breakfast_price: 1,
            lunch_price: 1,
            dinner_price: 1
          }
        }
      ]);

      console.log(bidpackage);
      for (let i = 0; i < bidpackage.length; i++) {
        // for (let j = 0; j < bidpackage[i].travel_by.length; j++) {
        //     bidpackage[i].travel_by[j] = {travel: bidpackage[i].travel_by[j]}
        // }
        var meal = bidpackage[i].meal_required[0];
        for (let j = 1; j < bidpackage[i].meal_required.length; j++) {
          meal = meal + "," + bidpackage[i].meal_required[j];
        }
        bidpackage[i].meal_required = meal;

        var types = bidpackage[i].meal_types[0];
        for (let j = 1; j < bidpackage[i].meal_types.length; j++) {
          types = types + "," + bidpackage[i].meal_types[j];
        }
        bidpackage[i].meal_types = types;
        var travel = bidpackage[i].travel_by[0];
        for (let j = 1; j < bidpackage[i].travel_by.length; j++) {
          travel = travel + "," + bidpackage[i].travel_by[j];
        }
        bidpackage[i].travel_by = travel;

        var category = bidpackage[i].destination_category[0];
        for (let j = 1; j < bidpackage[i].destination_category.length; j++) {
          category = category + "," + bidpackage[i].destination_category[j];
        }
        bidpackage[i].destination_category = category;
        var hotel = bidpackage[i].hotel_types[0];
        for (let j = 1; j < bidpackage[i].hotel_types.length; j++) {
          hotel = hotel + "," + bidpackage[i].hotel_types[j];
        }
        bidpackage[i].hotel_types = hotel;
        for (let j = 0; j < bidpackage[i].include_services.length; j++) {
          bidpackage[i].include_services[j] = { include_services_value: bidpackage[i].include_services[j] };
        }
        for (let j = 0; j < bidpackage[i].exclude_services.length; j++) {
          bidpackage[i].exclude_services[j] = { exclude_services_value: bidpackage[i].exclude_services[j] };
        }
        // for (let j = 0; j < bidpackage[i].itineries.length; j++) {
        //   bidpackage[i].itineries[j].photo =
        //     generateFileDownloadLinkPrefix(req.localHostURL) + bidpackage[i].itineries[j].photo;
        // }
        for (let j = 0; j < bidpackage[i].itineries.length; j++) {
          bidpackage[i].itineries[j].photo = await image_url("itinary", bidpackage[i].itineries[j].photo);

          // bidpackage[i].itineries[j].hotel_itienrary = bidpackage[i].itineries[j].hotel_itienrary.map((hotel) => {
          //   return {
          //     ...hotel,
          //     rooms: hotel.rooms.filter((room) => room._id.toString() === bidpackage[i].itineries[j].room_id.toString())
          //   };
          // });
        }
      }
      // bidpackage.forEach(element => {
      //     // element.travel_by = element.travel_by[0]
      //     element.meal_required = element.meal_required[0];
      //     element.meal_types = element.meal_types[0]
      // });
      return this.sendJSONResponse(
        res,
        "bidpackage Requiremnetdata retrived",
        {
          length: 1
        },
        bidpackage
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async adminside_bid_detail(req, res) {
    try {
      const bid_id = req.query._id;
      const tokenData = req.userData;

      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }

      const packageProfitMargin = await package_profit_margin.find();
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const baseHotelPhotoURL = "https://syt-i471.onrender.com/images/hotel_itienrary/";
      const photoBaseURL = "https://syt-i471.onrender.com/images/itinary/";

      const bid_details = await Bidschema.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(bid_id) } },
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
            from: "itineries",
            localField: "_id",
            foreignField: "bid_id",
            as: "itineries_details",
            pipeline: [
              {
                $lookup: {
                  from: "hotel_itienraries",
                  localField: "hotel_itienrary_id",
                  foreignField: "_id",
                  as: "hotel_itienrary",
                  pipeline: [
                    {
                      $project: {
                        _id: 0, // Exclude the _id field
                        hotel_name: 1,
                        rooms: 1
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  hotel_name: { $arrayElemAt: ["$hotel_itienrary.hotel_name", 0] },
                  rooms: { $arrayElemAt: ["$hotel_itienrary.rooms", 0] }
                }
              },
              {
                $project: {
                  hotel_itienrary: 0
                }
              }
            ]
          }
        },
        {
          $set: {
            itineries_details: {
              $map: {
                input: "$itineries_details",
                as: "itinerary",
                in: {
                  $mergeObjects: [
                    "$$itinerary",
                    {
                      rooms: {
                        $filter: {
                          input: "$$itinerary.rooms",
                          as: "room",
                          cond: { $eq: ["$$room._id", "$$itinerary.room_id"] }
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
            from: "hotel_itienraries",
            localField: "itineries_details.hotel_itienrary_id",
            foreignField: "_id",
            as: "hotel_itienrary"
          }
        },
        {
          $addFields: {
            itineries_details: {
              $map: {
                input: "$itineries_details",
                as: "itinerary",
                in: {
                  $mergeObjects: [
                    "$$itinerary",
                    {
                      photo: { $concat: [photoBaseURL, "$$itinerary.photo"] } // Add photo URL
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
                                  input: "$itineries_details",
                                  as: "itinerary",
                                  cond: {
                                    $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"]
                                  }
                                }
                              },
                              as: "itinerary",
                              in: { $toString: "$$itinerary.day" }
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
                          in: { $concat: [baseHotelPhotoURL, "$$photo"] }
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
            from: "custom_requirements",
            localField: "custom_requirement_id",
            foreignField: "_id",
            as: "custom_requirenment",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  localField: "user_id",
                  foreignField: "_id",
                  as: "users",
                  pipeline: [
                    {
                      $lookup: {
                        from: "customers",
                        localField: "_id",
                        foreignField: "user_id",
                        as: "customer_details"
                      }
                    },
                    {
                      $project: {
                        password: 0
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "agency_id",
            foreignField: "_id",
            as: "agency",
            pipeline: [
              {
                $lookup: {
                  from: "agencypersonals",
                  localField: "_id",
                  foreignField: "user_id",
                  as: "agency_personal_details",
                  pipeline: [
                    {
                      $project: {
                        password: 0
                      }
                    }
                  ]
                }
              },
              {
                $project: {
                  password: 0
                }
              }
            ]
          }
        }
      ]);

      // Attach admin margin based on the month
      // for (let bidDetail of bid_details) {
      //   const bidDate = bidDetail.start_date;
      //   const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      //   const currentMonth = monthNames[bidDate.getMonth()];

      //   const userAdminMargin = packageProfitMargin.find(margin => margin.state_name === bidDetail.destination);

      //   const relevantUserMargin = userAdminMargin ? userAdminMargin.month_and_margin_user.find(m => m.month_name === currentMonth) : null;

      //   bidDetail.admin_margin = relevantUserMargin || "No margin found for this user";
      // }

      for (let bidDetail of bid_details) {
        const bidDate = new Date(bidDetail.start_date); // Ensure bidDate is a Date object
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

        // Get the current month name based on bidDate
        const currentMonth = monthNames[bidDate.getMonth()];

        // Find if the destination exists in the packageProfitMargin
        const userAdminMargin = packageProfitMargin.find((margin) => margin.state_name === bidDetail.destination);

        // If a match is found, find the margin for the current month
        if (userAdminMargin) {
          const relevantUserMargin = userAdminMargin.month_and_margin_user.find((m) => m.month_name === currentMonth);

          // If a margin is found for the current month, use it; otherwise, default to 0
          bidDetail.admin_margin = relevantUserMargin || {
            month_name: currentMonth,
            margin_percentage: "10"
          };
        } else {
          // If no destination is found, set admin_margin to 0 for the current month
          bidDetail.admin_margin = {
            month_name: currentMonth,
            margin_percentage: "10"
          };
        }
      }

      return this.sendJSONResponse(res, "Bid Data!", { length: 1 }, bid_details);
    } catch (error) {
      return this.sendErrorResponse(req, res, error);
    }
  }

  //
  async get_bid(req, res) {
    try {
      const bid_id = req.query._id;
      // const tokenData = req.userData;
      // const agencyData = await agencySchema.find({ _id: tokenData.id });

      // if (agencyData.length === 0) {
      //   throw new Forbidden("you are not agency");
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

      const get_bid = await Bidschema.aggregate([
        {
          $match: { agency_id: mongoose.Types.ObjectId(tokenData.id), _id: mongoose.Types.ObjectId(bid_id) }
        },
        {
          $lookup: {
            from: "itineries",
            localField: "_id",
            foreignField: "bid_id",
            as: "itinerie",
            pipeline: [
              {
                $lookup: {
                  from: "hotel_itienraries",
                  localField: "hotel_itienrary_id",
                  foreignField: "_id",
                  as: "hotel_itienrary",
                  pipeline: [
                    {
                      $project: {
                        _id: 0, // Exclude the _id field
                        hotel_name: 1,
                        rooms: 1
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  hotel_name: { $arrayElemAt: ["$hotel_itienrary.hotel_name", 0] },
                  rooms: { $arrayElemAt: ["$hotel_itienrary.rooms", 0] }
                }
              },
              {
                $project: {
                  hotel_itienrary: 0
                }
              }
            ]
          }
        },
        {
          $set: {
            itinerie: {
              $map: {
                input: "$itinerie",
                as: "itinerary",
                in: {
                  $mergeObjects: [
                    "$$itinerary",
                    {
                      rooms: {
                        $filter: {
                          input: "$$itinerary.rooms",
                          as: "room",
                          cond: { $eq: ["$$room._id", "$$itinerary.room_id"] }
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
          $set: {
            itinerie: {
              $map: {
                input: "$itinerie",
                in: {
                  $mergeObjects: [
                    "$$this",
                    {
                      photo: {
                        // $concat: ["+1", "$$this.number"]
                        $concat: [`${generateFileDownloadLinkPrefix(req.localHostURL)}`, "$$this.photo"]
                      }
                    }
                  ]
                }
              }
            }
          }
        }
        // {
        //   $set: {
        //     itinerie: {
        //       $map: {
        //         input: "$itinerie",
        //         in: {
        //           $mergeObjects: [
        //             "$$this",
        //            {
        //              photo:
        //                "$$itinerie.photo"
        //            }
        //           ]
        //         }
        //       }
        //     }
        //   }
        // },
        // {
        //   $set: {
        //     // pancard_image: { $concat: [`${generateFileDownloadLinkPrefix(req.localHostURL)}`, "$pancard_image"] },
        //     // agency_logo: { $concat: [`${generateFileDownloadLinkPrefix(req.localHostURL)}`, "$agency_logo"] },
        //     // status_change_by: null,
        //     // password: null,
        //     "itinerie": { $concat: [`${generateFileDownloadLinkPrefix(req.localHostURL)}`, "$$itinerie.photo"] },
        //   },
        // },
        // {
        //   $project: {
        //     // itinerie: {
        //     //   photo: { $concat: [`${generateFileDownloadLinkPrefix(req.localHostURL)}`, "$photo"] },
        //     // },
        //     // "itinerie.photo": { $concat: [, "$itinerie.photo"] },
        //     // city: "$city",
        //     itinerie:
        //        { $map:
        //           {
        //              input: "$itinerieCopy",
        //              as: "itinerieAlias",
        //              in: { $add :  }
        //           }
        //     }
        //   },
        // },
        // {
        //   $addFields: {
        //     newField: {
        //       "$map": {
        //         "input": "$itinerie.photo",
        //         "in": {
        //           "$concat": [
        //             `${generateFileDownloadLinkPrefix(req.localHostURL)}`,
        //             "$$this",
        //             // "$acronym"
        //           ]
        //         }
        //       }
        //     }
        //   }
        // }
      ]);

      return this.sendJSONResponse(
        res,
        "bid package data retrived",
        {
          length: 1
        },
        get_bid
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async getbidDetails(req, res) {
  //   try {
  //     const bid_id = req.query._id;

  //     if (!bid_id || `${bid_id}`.length !== 24) {
  //       console.log(`bid_id is empty ->${bid_id}`);
  //       throw new Error("bid_id is invalid");
  //       return;
  //     }

  //     const getbidDetails = await Bidschema.aggregate([
  //       {
  //         $match: { _id: new mongoose.Types.ObjectId(bid_id) }
  //       },
  //       {
  //         $lookup: {
  //           from: "itineries",
  //           localField: "_id",
  //           foreignField: "bid_id",
  //           as: "itineries",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "hotel_itienraries",
  //                 localField: "hotel_itienrary_id",
  //                 foreignField: "_id",
  //                 as: "hotel_itienrary"
  //               }
  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "custom_requirements",
  //           localField: "custom_requirement_id",
  //           foreignField: "_id",
  //           as: "custom_requirement"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "agencypersonals",
  //           localField: "agency_id",
  //           foreignField: "user_id",
  //           as: "agency_details"
  //         }
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           agency_id: 1,
  //           custom_requirement_id: 1,
  //           price_per_person: 1,
  //           bid_date: 1,
  //           total_days: 1,
  //           total_adult: 1,
  //           total_child: 1,
  //           Infant: 1,
  //           total_nights: 1,
  //           departure: 1,
  //           travel_by: 1,
  //           sightseeing: 1,
  //           hotel_types: 1,
  //           meal_required: 1,
  //           meal_types: 1,
  //           other_services_by_agency: 1,
  //           price_per_person_infant: 1,
  //           price_per_person_child: 1,
  //           price_per_person_adult: 1,
  //           room_sharing: 1,
  //           total_amount: 1,
  //           personal_care: 1,
  //           additional_requirement: 1,
  //           start_date1: {
  //             $dateToString: { format: "%d/%m/%Y", date: "$start_date" }
  //           },
  //           end_date1: {
  //             $dateToString: { format: "%d/%m/%Y", date: "$end_date" }
  //           },
  //           destination_category: 1,
  //           exclude_services: 1,
  //           bid_status: 1,
  //           include_services: 1,
  //           itineries: 1,
  //           custom_requirement_status: { $arrayElemAt: ["$custom_requirement.status", 0] },  //full_name
  //           agency_name: { $arrayElemAt: ["$agency_details.agency_name", 0] }
  //           // 'agency_details.full_name': 1
  //         }
  //       }
  //     ]);

  //     console.log(getbidDetails);
  //     for (let i = 0; i < getbidDetails.length; i++) {
  //       // for (let j = 0; j < getbidDetails[i].travel_by.length; j++) {
  //       //     getbidDetails[i].travel_by[j] = {travel: getbidDetails[i].travel_by[j]}
  //       // }
  //       var meal = getbidDetails[i].meal_required[0];
  //       for (let j = 1; j < getbidDetails[i].meal_required.length; j++) {
  //         meal = meal + "," + getbidDetails[i].meal_required[j];
  //       }
  //       getbidDetails[i].meal_required = meal;

  //       var types = getbidDetails[i].meal_types[0];
  //       for (let j = 1; j < getbidDetails[i].meal_types.length; j++) {
  //         types = types + "," + getbidDetails[i].meal_types[j];
  //       }
  //       getbidDetails[i].meal_types = types;
  //       var travel = getbidDetails[i].travel_by[0];
  //       for (let j = 1; j < getbidDetails[i].travel_by.length; j++) {
  //         travel = travel + "," + getbidDetails[i].travel_by[j];
  //       }
  //       getbidDetails[i].travel_by = travel;

  //       var category = getbidDetails[i].destination_category[0];
  //       for (let j = 1; j < getbidDetails[i].destination_category.length; j++) {
  //         category = category + "," + getbidDetails[i].destination_category[j];
  //       }
  //       getbidDetails[i].destination_category = category;
  //       var hotel = getbidDetails[i].hotel_types[0];
  //       for (let j = 1; j < getbidDetails[i].hotel_types.length; j++) {
  //         hotel = hotel + "," + getbidDetails[i].hotel_types[j];
  //       }
  //       getbidDetails[i].hotel_types = hotel;
  //       for (let j = 0; j < getbidDetails[i].include_services.length; j++) {
  //         getbidDetails[i].include_services[j] = { include_services_value: getbidDetails[i].include_services[j] };
  //       }
  //       for (let j = 0; j < getbidDetails[i].exclude_services.length; j++) {
  //         getbidDetails[i].exclude_services[j] = { exclude_services_value: getbidDetails[i].exclude_services[j] };
  //       }
  //       // for (let j = 0; j < getbidDetails[i].itineries.length; j++) {
  //       //   getbidDetails[i].itineries[j].photo =
  //       //     generateFileDownloadLinkPrefix(req.localHostURL) + getbidDetails[i].itineries[j].photo;
  //       // }
  //       for (let j = 0; j < getbidDetails[i].itineries.length; j++) {
  //         getbidDetails[i].itineries[j].photo = await image_url("itinary", getbidDetails[i].itineries[j].photo);
  //       }

  //     }
  //     // getbidDetails.forEach(element => {
  //     //     // element.travel_by = element.travel_by[0]
  //     //     element.meal_required = element.meal_required[0];
  //     //     element.meal_types = element.meal_types[0]
  //     // });
  //     return this.sendJSONResponse(
  //       res,
  //       "getbidDetails Requiremnetdata retrived",
  //       {
  //         length: 1
  //       },
  //       getbidDetails
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async getbidDetails(req, res) {
    try {
      const bid_id = req.query._id;

      if (!bid_id || `${bid_id}`.length !== 24) {
        console.log(`bid_id is empty ->${bid_id}`);
        throw new Error("bid_id is invalid");
        return;
      }

      const packageProfitMargin = await package_profit_margin.find();
      const baseHotelPhotoURL = "https://syt-i471.onrender.com/images/hotel_itienrary/";

      const getbidDetails = await Bidschema.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(bid_id) }
        },
        {
          $lookup: {
            from: "itineries",
            localField: "_id",
            foreignField: "bid_id",
            as: "itineries",
            pipeline: [
              {
                $lookup: {
                  from: "hotel_itienraries",
                  localField: "hotel_itienrary_id",
                  foreignField: "_id",
                  as: "hotel_itienrary",
                  pipeline: [
                    {
                      $project: {
                        _id: 0, // Exclude the _id field
                        hotel_name: 1,
                        rooms: 1,
                        hotel_address: 1,
                        hotel_type: 1,
                        hotel_city: 1,
                        hotel_state: 1,
                        hotel_description: 1,
                        other: 1,
                        lunch_price: 1,
                        dinner_price: 1,
                        breakfast_price: 1
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  hotel_name: { $arrayElemAt: ["$hotel_itienrary.hotel_name", 0] },
                  rooms: { $arrayElemAt: ["$hotel_itienrary.rooms", 0] },
                  hotel_address: { $arrayElemAt: ["$hotel_itienrary.hotel_address", 0] },
                  hotel_type: { $arrayElemAt: ["$hotel_itienrary.hotel_type", 0] },
                  hotel_city: { $arrayElemAt: ["$hotel_itienrary.hotel_city", 0] },
                  hotel_state: { $arrayElemAt: ["$hotel_itienrary.hotel_state", 0] },
                  hotel_description: { $arrayElemAt: ["$hotel_itienrary.hotel_description", 0] },
                  other: { $arrayElemAt: ["$hotel_itienrary.other", 0] },
                  lunch_price: { $arrayElemAt: ["$hotel_itienrary.lunch_price", 0] },
                  dinner_price: { $arrayElemAt: ["$hotel_itienrary.dinner_price", 0] },
                  breakfast_price: { $arrayElemAt: ["$hotel_itienrary.breakfast_price", 0] }
                }
              },
              {
                $project: {
                  hotel_itienrary: 0
                }
              }
            ]
          }
        },
        // {
        //   $set: {
        //     itineries: {
        //       $map: {
        //         input: "$itineries",
        //         as: "itinerary",
        //         in: {
        //           $mergeObjects: [
        //             "$$itinerary",
        //             {
        //               rooms: {
        //                 $filter: {
        //                   input: "$$itinerary.rooms",
        //                   as: "room",
        //                   cond: { $eq: ["$$room._id", "$$itinerary.room_id"] }
        //                 }
        //               }
        //             }
        //           ]
        //         }
        //       }
        //     }
        //   }
        // },
        {
          $lookup: {
            from: "hotel_itienraries",
            localField: "itineries.hotel_itienrary_id",
            foreignField: "_id",
            as: "hotel_itienrary"
          }
        },
        {
          $lookup: {
            from: "custom_requirements",
            localField: "custom_requirement_id",
            foreignField: "_id",
            as: "custom_requirement"
          }
        },
        {
          $lookup: {
            from: "agencypersonals",
            localField: "agency_id",
            foreignField: "user_id",
            as: "agency_details"
          }
        },
        {
          $lookup: {
            from: "destination_categories",
            localField: "destination_category",
            foreignField: "_id",
            as: "destination_categories_name",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  category_name: 1
                }
              }
            ]
          }
        },
        {
          $set: {
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
                                  input: "$itineries",
                                  as: "itinerary",
                                  cond: {
                                    $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"]
                                  }
                                }
                              },
                              as: "itinerary",
                              in: { $toString: "$$itinerary.day" }
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
                          in: { $concat: [baseHotelPhotoURL, "$$photo"] }
                        }
                      },
                      selected_rooms: {
                        $reduce: {
                          input: {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$itineries",
                                  as: "itinerary",
                                  cond: {
                                    $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"]
                                  }
                                }
                              },
                              as: "itinerary",
                              in: {
                                selected_rooms: {
                                  $filter: {
                                    input: "$$hotel.rooms",
                                    as: "room",
                                    cond: {
                                      $eq: ["$$room._id", "$$itinerary.room_id"]
                                    }
                                  }
                                }
                              }
                            }
                          },
                          initialValue: [],
                          in: {
                            $setUnion: ["$$value", "$$this.selected_rooms"]
                          }
                        }
                      },
                      // Add breakfast, lunch, dinner here
                      itinerary_breakfast: {
                        $anyElementTrue: {
                          $map: {
                            input: {
                              $filter: {
                                input: "$itineries",
                                as: "itinerary",
                                cond: { $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"] }
                              }
                            },
                            as: "itinerary",
                            in: "$$itinerary.breakfast"
                          }
                        }
                      },
                      itinerary_lunch: {
                        $anyElementTrue: {
                          $map: {
                            input: {
                              $filter: {
                                input: "$itineries",
                                as: "itinerary",
                                cond: { $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"] }
                              }
                            },
                            as: "itinerary",
                            in: "$$itinerary.lunch"
                          }
                        }
                      },
                      itinerary_dinner: {
                        $anyElementTrue: {
                          $map: {
                            input: {
                              $filter: {
                                input: "$itineries",
                                as: "itinerary",
                                cond: { $eq: ["$$itinerary.hotel_itienrary_id", "$$hotel._id"] }
                              }
                            },
                            as: "itinerary",
                            in: "$$itinerary.dinner"
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
          $project: {
            _id: 1,
            agency_id: 1,
            custom_requirement_id: 1,
            price_per_person: 1,
            name: 1,
            bid_date: 1,
            total_days: 1,
            total_adult: 1,
            total_child: 1,
            Infant: 1,
            total_nights: 1,
            departure: 1,
            destination: 1,
            travel_by: 1,
            sightseeing: 1,
            hotel_types: 1,
            meal_required: 1,
            meal_types: 1,
            other_services_by_agency: 1,
            price_per_person_infant: 1,
            price_per_person_child: 1,
            price_per_person_adult: 1,
            room_sharing: 1,
            package_type: 1,
            total_amount: 1,
            personal_care: 1,
            additional_requirement: 1,
            start_date1: {
              $dateToString: { format: "%d/%m/%Y", date: "$start_date" }
            },
            end_date1: {
              $dateToString: { format: "%d/%m/%Y", date: "$end_date" }
            },
            destination_category: 1,
            destination_categories_name: 1,
            exclude_services: 1,
            bid_status: 1,
            include_services: 1,
            itineries: 1,
            hotel_itienrary: 1,
            package_valid_till_for_booking: 1,
            admin_margin_price: 1,
            admin_margin: 1,
            breakfast_price: 1,
            lunch_price: 1,
            dinner_price: 1,
            custom_requirement_status: { $arrayElemAt: ["$custom_requirement.status", 0] },
            agency_name: { $arrayElemAt: ["$agency_details.agency_name", 0] }
          }
        }
      ]);

      const display_agencys_all_review = await Bidschema.aggregate([
        {
          $match: { agency_id: mongoose.Types.ObjectId(getbidDetails[0].agency_id) }
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
          $match: { user_id: mongoose.Types.ObjectId(getbidDetails[0].agency_id) }
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

      console.log(display_agencys_all_review_package);

      let totalStars = 0;
      let totalReviews = 0;

      const combinedReviewStats = [...display_agencys_all_review, ...display_agencys_all_review_package];
      console.log(combinedReviewStats);

      for (const entry of combinedReviewStats) {
        totalStars += entry.average_star * entry.total_reviews;
        totalReviews += entry.total_reviews;
      }

      const averageStarRating = totalStars / totalReviews;
      const totalReview = totalReviews;

      getbidDetails[0].totalReview = totalReview || 0;
      getbidDetails[0].averageStarRating = averageStarRating || 0;

      console.log(getbidDetails);
      for (let i = 0; i < getbidDetails.length; i++) {
        let bidDetail = getbidDetails[i];

        // Convert start_date1 (in DD/MM/YYYY format) back to a Date object
        const [day, month, year] = bidDetail.start_date1.split("/").map(Number);
        const startDateObject = new Date(year, month - 1, day); // month is 0-indexed in JavaScript

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
        const currentMonth = monthNames[startDateObject.getMonth()]; // Get the month name
        console.log(currentMonth);

        // Combine values for certain fields
        bidDetail.meal_required = bidDetail.meal_required.join(",");
        bidDetail.meal_types = bidDetail.meal_types.join(",");
        bidDetail.travel_by = bidDetail.travel_by.join(",");
        bidDetail.destination_category = bidDetail.destination_category.join(",");
        bidDetail.hotel_types = bidDetail.hotel_types.join(",");
        bidDetail.total_person = bidDetail.total_adult + bidDetail.total_child + bidDetail.Infant;

        bidDetail.include_services = bidDetail.include_services.map((service) => ({ include_services_value: service }));
        bidDetail.exclude_services = bidDetail.exclude_services.map((service) => ({ exclude_services_value: service }));

        // const userAdminMargin = packageProfitMargin.find(margin => margin.state_name === bidDetail.destination);

        // // Find the relevant user margin by filtering by month_and_margin_user (for users)
        // const relevantUserMargin = userAdminMargin ? userAdminMargin.month_and_margin_user.find(m => m.month_name === currentMonth) : null;

        // // Attach the admin margin if it exists
        // if (relevantUserMargin) {
        //   bidDetail.admin_margin = relevantUserMargin;
        // } else {
        //   bidDetail.admin_margin = "No margin found for this user";
        // }

        // Find if the destination exists in the packageProfitMargin
        const userAdminMargin = packageProfitMargin.find(
          (margin) => margin.state_name.toLowerCase() === bidDetail.destination.toLowerCase()
        );

        // If a match is found, find the margin for the current month
        if (userAdminMargin) {
          const relevantUserMargin = userAdminMargin.month_and_margin_user.find((m) => m.month_name === currentMonth);

          // If a margin is found for the current month, use it; otherwise, default to 0
          bidDetail.admin_margin = relevantUserMargin || {
            month_name: currentMonth,
            margin_percentage: "10"
          };
        } else {
          // If no destination is found, set admin_margin to 0 for the current month
          bidDetail.admin_margin = {
            month_name: currentMonth,
            margin_percentage: "10"
          };
        }

        for (let i = 0; i < getbidDetails.length; i++) {
          const adminMarginPercentage = parseFloat(getbidDetails[i].admin_margin.margin_percentage) || 0;

          console.log("Admin Margin Percentage:", adminMarginPercentage);

          // Calculate the new values with admin margin
          const calculateWithMargin = (amount) => {
            return amount + (amount * adminMarginPercentage) / 100;
          };

          getbidDetails[i].total_amount = calculateWithMargin(getbidDetails[i].total_amount);
          getbidDetails[i].price_per_person_child = calculateWithMargin(getbidDetails[i].price_per_person_child);
          getbidDetails[i].price_per_person_adult = calculateWithMargin(getbidDetails[i].price_per_person_adult);
          getbidDetails[i].price_per_person_infant = calculateWithMargin(getbidDetails[i].price_per_person_infant);
        }

        // Process itinerary photos
        for (let j = 0; j < bidDetail.itineries.length; j++) {
          bidDetail.itineries[j].photo = await image_url("itinary", bidDetail.itineries[j].photo);

          // bidDetail.itineries[j].hotel_itienrary = bidDetail.itineries[j].hotel_itienrary.map((hotel) => {
          //   return {
          //     ...hotel,
          //     rooms: hotel.rooms.filter((room) => room._id.toString() === bidDetail.itineries[j].room_id.toString())
          //   };
          // });
        }
      }

      return this.sendJSONResponse(res, "getbidDetails Requirement data retrieved", { length: 1 }, getbidDetails);
    } catch (error) {
      console.error("Error retrieving bid details:", error);
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_agency_bid(req, res) {
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

      const display_agency_bid = await Bidschema.aggregate([
        {
          $match: { agency_id: mongoose.Types.ObjectId(tokenData.id) }
        },
        {
          $lookup: {
            from: "itineries",
            localField: "_id",
            foreignField: "bid_id",
            as: "itinerie",
            pipeline: [
              {
                $lookup: {
                  from: "hotel_itienraries",
                  localField: "hotel_itienrary_id",
                  foreignField: "_id",
                  as: "hotel_itienrary",
                  pipeline: [
                    {
                      $project: {
                        _id: 0, // Exclude the _id field
                        hotel_name: 1, // Include only hotel_name field
                        rooms: 1
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  hotel_name: { $arrayElemAt: ["$hotel_itienrary.hotel_name", 0] }, // Flatten hotel_name to top level,
                  rooms: { $arrayElemAt: ["$hotel_itienrary.rooms", 0] }
                }
              },
              {
                $project: {
                  hotel_itienrary: 0
                }
              }
            ]
          }
        },
        {
          $set: {
            itinerie: {
              $map: {
                input: "$itinerie",
                as: "itinerary",
                in: {
                  $mergeObjects: [
                    "$$itinerary",
                    {
                      rooms: {
                        $filter: {
                          input: "$$itinerary.rooms",
                          as: "room",
                          cond: { $eq: ["$$room._id", "$$itinerary.room_id"] }
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
            localField: "destination_category",
            foreignField: "_id",
            as: "destination_category_name"
          }
        },
        {
          $lookup: {
            from: "custom_requirements",
            localField: "custom_requirement_id",
            foreignField: "_id",
            as: "custom_requirement"
          }
        },
        {
          $unwind: "$custom_requirement"
        },
        {
          $addFields: {
            grand_total: { $add: ["$total_amount", "$admin_margin_price"] }
          }
        },
        {
          $project: {
            _id: 1,
            agency_id: 1,
            custom_requirement_id: 1,
            price_per_person: 1,
            bid_date: 1,
            name: 1,
            total_days: 1,
            total_nights: 1,
            travel_by: 1,
            sightseeing: 1,
            hotel_types: 1,
            meal_required: 1,
            meal_types: 1,
            departure: 1,
            destination: 1,
            total_adult: 1,
            package_type: 1,
            total_child: 1,
            Infant: 1,
            include_details: 1,
            start_date: 1,
            end_date: 1,
            breakfast_price: 1,
            lunch_price: 1,
            dinner_price: 1,
            destination_category: 1,
            include_services: 1,
            exclude_services: 1,
            total_amount: 1,
            bid_status: 1,
            additional_requirement: 1,
            other_services_by_agency: 1,
            createdAt: 1,
            updatedAt: 1,
            itinerie: 1,
            price_per_person_infant: 1,
            price_per_person_child: 1,
            price_per_person_adult: 1,
            room_sharing: 1,
            package_valid_till_for_booking: 1,
            admin_margin_price: 1,
            admin_margin: 1,
            grand_total: 1,
            destination_category_name: {
              category_name: 1
            },
            full_name: "$custom_requirement.full_name",
            budget_per_person: "$custom_requirement.budget_per_person"
            // package_valid_till_for_booking: "$custom_requirement.package_valid_till_for_booking",
          }
        },
        { $sort: { createdAt: -1 } }
      ]);

      return this.sendJSONResponse(
        res,
        " display bid D2etails ",
        {
          length: 1
        },
        display_agency_bid
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async display_agency_bid(req, res) {
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

  //     const currentDate = new Date();
  //     const monthNames = [
  //       "January",
  //       "February",
  //       "March",
  //       "April",
  //       "May",
  //       "June",
  //       "July",
  //       "August",
  //       "September",
  //       "October",
  //       "November",
  //       "December"
  //     ];
  //     const currentMonthName = monthNames[currentDate.getMonth()]; // Get current month name

  //     const display_agency_bid = await Bidschema.aggregate([
  //       {
  //         $match: { agency_id: mongoose.Types.ObjectId(tokenData.id) }
  //       },
  //       {
  //         $lookup: {
  //           from: "itineries",
  //           localField: "_id",
  //           foreignField: "bid_id",
  //           as: "itinerie",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "hotel_itienraries",
  //                 localField: "hotel_itienrary_id",
  //                 foreignField: "_id",
  //                 as: "hotel_itienrary",
  //                 pipeline: [
  //                   {
  //                     $project: {
  //                       _id: 0,
  //                       hotel_name: 1,
  //                       rooms: 1
  //                     }
  //                   }
  //                 ]
  //               }
  //             },
  //             {
  //               $addFields: {
  //                 hotel_name: { $arrayElemAt: ["$hotel_itienrary.hotel_name", 0] },
  //                 rooms: { $arrayElemAt: ["$hotel_itienrary.rooms", 0] }
  //               }
  //             },
  //             {
  //               $project: {
  //                 hotel_itienrary: 0
  //               }
  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "destination_categories",
  //           localField: "destination_category",
  //           foreignField: "_id",
  //           as: "destination_category_name"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "custom_requirements",
  //           localField: "custom_requirement_id",
  //           foreignField: "_id",
  //           as: "custom_requirement"
  //         }
  //       },
  //       { $unwind: "$custom_requirement" },

  //       // Add admin margin percentage based on destination and current month
  //       // {
  //       //   $lookup: {
  //       //     from: "package_margins",
  //       //     let: { dest_name: "$destination", month_name: currentMonthName },
  //       //     pipeline: [
  //       //       {
  //       //         $match: {
  //       //           $expr: {
  //       //             $and: [
  //       //               { $eq: ["$state_name", "$$dest_name"] },
  //       //               { $eq: ["$month_and_margin_user.month_name", "$$month_name"] }
  //       //             ]
  //       //           }
  //       //         }
  //       //       },
  //       //       {
  //       //         $project: {
  //       //           margin_percentage: { $arrayElemAt: ["$month_and_margin_user.margin_percentage", 0] }
  //       //         }
  //       //       }
  //       //     ],
  //       //     as: "admin_margin"
  //       //   }
  //       // },
  //       // {
  //       //   $addFields: {
  //       //     admin_margin: {
  //       //       $cond: {
  //       //         if: { $gt: [{ $size: "$admin_margin" }, 0] },
  //       //         then: { $arrayElemAt: ["$admin_margin.margin_percentage", 0] },
  //       //         else: 10 // Default margin 10% agar na mile
  //       //       }
  //       //     }
  //       //   }
  //       // },
  //       // {
  //       //   $addFields: {
  //       //     total_amount: {
  //       //       $round: [
  //       //         {
  //       //           $add: [
  //       //             "$total_amount",
  //       //             { $multiply: ["$total_amount", { $divide: ["$admin_margin_percentage", 100] }] }
  //       //           ]
  //       //         },
  //       //         2
  //       //       ]
  //       //     }
  //       //   }
  //       // },
  //       {
  //         $project: {
  //           _id: 1,
  //           agency_id: 1,
  //           custom_requirement_id: 1,
  //           price_per_person: 1,
  //           bid_date: 1,
  //           name: 1,
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
  //           package_type: 1,
  //           total_child: 1,
  //           Infant: 1,
  //           include_details: 1,
  //           start_date: 1,
  //           end_date: 1,
  //           breakfast_price: 1,
  //           lunch_price: 1,
  //           dinner_price: 1,
  //           destination_category: 1,
  //           include_services: 1,
  //           exclude_services: 1,
  //           total_amount: 1,
  //           bid_status: 1,
  //           additional_requirement: 1,
  //           other_services_by_agency: 1,
  //           createdAt: 1,
  //           updatedAt: 1,
  //           itinerie: 1,
  //           price_per_person_infant: 1,
  //           price_per_person_child: 1,
  //           price_per_person_adult: 1,
  //           room_sharing: 1,
  //           package_valid_till_for_booking: 1,
  //           admin_margin: 1,
  //           final_total_price: 1, // Final price after adding admin margin
  //           destination_category_name: {
  //             category_name: 1
  //           },
  //           full_name: "$custom_requirement.full_name",
  //           budget_per_person: "$custom_requirement.budget_per_person"
  //         }
  //       },
  //       { $sort: { createdAt: -1 } }
  //     ]);

  //     return this.sendJSONResponse(
  //       res,
  //       "Display Bid Details",
  //       {
  //         length: display_agency_bid.length
  //       },
  //       display_agency_bid
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error);
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  // async displayUserBidPackage_jaydev(req, res) {
  //   try {
  //     const tokenData = req.userData;
  //     const id = req.query.custom_requirement_id;
  //     const bidPackageData = await Bidschema.aggregate([
  //       {
  //         $match: {
  //           $and: [
  //             { bid_status: "submit" },
  //             { custom_requirement_id: new mongoose.Types.ObjectId(id) }
  //           ]
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "custom_requirements",
  //           localField: "custom_requirement_id",
  //           foreignField: "_id",
  //           as: "Custom_Requirement",
  //           pipeline: [
  //             {
  //               $lookup: {
  //                 from: "destinations",
  //                 localField: "destination",
  //                 foreignField: "_id",
  //                 as: "Destination"
  //               }
  //             }
  //           ]
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "agencypersonals",
  //           localField: "agency_id",
  //           foreignField: "user_id",
  //           as: "Agency"
  //         }
  //       },
  //       {
  //         $group: {
  //           _id: "$_id",
  //           price_per_person: { $first: "$price_per_person" },
  //           agency_id: { $first: "$agency_id" },
  //           name: { $first: "$name" },
  //           bid_date: { $first: "$bid_date" },
  //           agency_name: { $first: { $arrayElemAt: ["$Agency.agency_name", 0] } },
  //           agency_logo: { $first: { $arrayElemAt: ["$Agency.agency_logo", 0] } },
  //           total_days: { $first: "$total_days" },
  //           total_nights: { $first: "$total_nights" },
  //           hotel_types: { $first: "$hotel_types" },
  //           total_amount: { $first: "$total_amount" },
  //           price_per_person_infant: { $first: "$price_per_person_infant" },
  //           price_per_person_child: { $first: "$price_per_person_child" },
  //           price_per_person_adult: { $first: "$price_per_person_adult" },
  //           package_valid_till_for_booking: { $first: "$package_valid_till_for_booking" },
  //           room_sharing: { $first: "$room_sharing" },
  //         }
  //       },
  //       {
  //         $addFields: {
  //           bid_date1: { $dateToString: { format: "%d/%m/%Y", date: "$bid_date" } }
  //         }
  //       },
  //       {
  //         $project: {
  //           agency_id: 1,
  //           price_per_person: 1,
  //           name: 1,
  //           price_per_person_infant: 1,
  //           price_per_person_child: 1,
  //           price_per_person_adult: 1,
  //           room_sharing: 1,
  //           total_amount: 1,
  //           bid_date1: 1,
  //           agency_name: 1,
  //           agency_logo: 1,
  //           total_days: 1,
  //           total_nights: 1,
  //           hotel_types: 1,
  //           average_star: 1,
  //           total_reviews: 1,
  //           total_reviews_avg: 1,
  //           package_valid_till_for_booking: 1
  //         }
  //       }
  //     ]);

  //     const display_agencys_all_review = await Bidschema.aggregate([
  //       {
  //         $match: { agency_id: { $in: bidPackageData.map((item) => mongoose.Types.ObjectId(item.agency_id)) } }
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
  //                 from: "reviews",
  //                 localField: "_id",
  //                 foreignField: "book_package_id",
  //                 as: "review",
  //                 pipeline: [
  //                   {
  //                     $lookup: {
  //                       from: "customers",
  //                       localField: "user_id",
  //                       foreignField: "user_id",
  //                       as: "customer"
  //                     }
  //                   }
  //                 ]
  //               }
  //             },
  //           ]
  //         }
  //       },
  //       {
  //         $unwind: "$book_package"
  //       },
  //       {
  //         $unwind: "$book_package.review"
  //       },
  //       {
  //         $group: {
  //           _id: "$_id",
  //           agency_id: { $first: "$agency_id" },
  //           book_package: { $push: "$book_package" },
  //           average_star: { $avg: { $toDouble: "$book_package.review.star" } },
  //           total_reviews: { $sum: 1 }
  //         }
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           agency_id: 1,
  //           departure: 1,
  //           destination: 1,
  //           book_package: {
  //             _id: 1,
  //             review: {
  //               _id: 1,
  //               user_id: 1,
  //               star: 1,
  //               comment_box: 1,
  //               customer: {
  //                 _id: 1,
  //                 name: 1,
  //                 photo: 1
  //               }
  //             }
  //           },
  //           average_star: 1,
  //           total_reviews: 1
  //         }
  //       }
  //     ]);

  //     let totalStars = 0;
  //     let totalReviews = 0;

  //     for (const entry of display_agencys_all_review) {
  //       totalStars += entry.average_star * entry.total_reviews;
  //       totalReviews += entry.total_reviews;
  //     }

  //     const averageStarRating = totalStars / totalReviews;
  //     const totalReview = totalReviews;

  //     const agencyLogoBaseURL = "https://start-your-tour-api.onrender.com/images/agency/"

  //     for (const entry of bidPackageData) {

  //       if (entry.agency_logo) {
  //         entry.agency_logo = agencyLogoBaseURL + entry.agency_logo;
  //       }
  //     }

  //     const final_data = [];
  //     bidPackageData.forEach((element) => {
  //       const totalDays = element.total_days;
  //       const totalNights = element.total_nights;

  //       final_data.push({
  //         _id: element._id,
  //         agency_id: element.agency_id,
  //         Price: element.price_per_person,
  //         name: element.name,
  //         price_per_person_infant: element.price_per_person_infant,
  //         price_per_person_child: element.price_per_person_child,
  //         price_per_person_adult: element.price_per_person_adult,
  //         package_valid_till_for_booking: element.package_valid_till_for_booking,
  //         room_sharing: element.room_sharing,
  //         total_amount: element.total_amount,
  //         Date: element.bid_date1,
  //         Agency: element.agency_name,
  //         agency_logo: element.agency_logo,
  //         TotalDays: totalDays,
  //         TotalNights: totalNights,
  //         HotelTypes: element.hotel_types,
  //         averageStarRating: averageStarRating, // Include average star rating
  //         totalReview: totalReview,
  //         // total_reviews_avg: 0

  //       });
  //     });

  //     return this.sendJSONResponse(
  //       res,
  //       "bid package",
  //       {
  //         length: final_data.length,
  //         // average_star_rating: averageStarRating,
  //         // total_reviews: totalReviews,
  //         // total_reviews_avg: 0
  //       },
  //       final_data
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async displayUserBidPackage_jaydev(req, res) {
    try {
      const tokenData = req.userData;
      const id = req.query.custom_requirement_id;

      const packageProfitMargin = await package_profit_margin.find();

      console.log("ID:", id);

      const bidPackageData = await Bidschema.aggregate([
        {
          $match: {
            $and: [
              { bid_status: { $in: ["submit", "booked", "booked another package", "reject"] } },
              { custom_requirement_id: new mongoose.Types.ObjectId(id) }
            ]
          }
        },
        {
          $lookup: {
            from: "custom_requirements",
            localField: "custom_requirement_id",
            foreignField: "_id",
            as: "Custom_Requirement",
            pipeline: [
              {
                $lookup: {
                  from: "destinations",
                  localField: "destination",
                  foreignField: "_id",
                  as: "Destination"
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "agencypersonals",
            localField: "agency_id",
            foreignField: "user_id",
            as: "Agency"
          }
        },
        {
          $group: {
            _id: "$_id",
            price_per_person: { $first: "$price_per_person" },
            agency_id: { $first: "$agency_id" },
            name: { $first: "$name" },
            destination: { $first: "$destination" },
            bid_date: { $first: "$bid_date" },
            start_date: { $first: "$start_date" },
            end_date: { $first: "$end_date" },
            bid_status: { $first: "$bid_status" },
            breakfast_price: { $first: "$breakfast_price" },
            lunch_price: { $first: "$lunch_price" },
            dinner_price: { $first: "$dinner_price" },
            agency_name: { $first: { $arrayElemAt: ["$Agency.agency_name", 0] } },
            agency_logo: { $first: { $arrayElemAt: ["$Agency.agency_logo", 0] } },
            total_days: { $first: "$total_days" },
            total_nights: { $first: "$total_nights" },
            hotel_types: { $first: "$hotel_types" },
            total_amount: { $first: "$total_amount" },
            price_per_person_infant: { $first: "$price_per_person_infant" },
            price_per_person_child: { $first: "$price_per_person_child" },
            price_per_person_adult: { $first: "$price_per_person_adult" },
            package_valid_till_for_booking: { $first: "$package_valid_till_for_booking" },
            room_sharing: { $first: "$room_sharing" }
          }
        },
        {
          $addFields: {
            bid_date1: { $dateToString: { format: "%d/%m/%Y", date: "$bid_date" } }
          }
        },
        {
          $addFields: {
            start_date1: { $dateToString: { format: "%d/%m/%Y", date: "$start_date" } }
          }
        },
        {
          $project: {
            agency_id: 1,
            price_per_person: 1,
            name: 1,
            destination: 1,
            bid_status: 1,
            price_per_person_infant: 1,
            price_per_person_child: 1,
            price_per_person_adult: 1,
            room_sharing: 1,
            total_amount: 1,
            bid_date1: 1,
            end_date: 1,
            start_date1: 1,
            agency_name: 1,
            agency_logo: 1,
            total_days: 1,
            total_nights: 1,
            hotel_types: 1,
            average_star: 1,
            total_reviews: 1,
            package_valid_till_for_booking: 1,
            breakfast_price: 1,
            lunch_price: 1,
            dinner_price: 1
          }
        }
      ]);

      for (let i = 0; i < bidPackageData.length; i++) {
        const [day, month, year] = bidPackageData[i].start_date1.split("/").map(Number);
        const startDateObject = new Date(year, month - 1, day);

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
        const currentMonth = monthNames[startDateObject.getMonth()];

        console.log("Current Month:", currentMonth);

        // Destination ka admin margin find karna
        const userAdminMargin = packageProfitMargin.find(
          (margin) => margin.state_name.toLowerCase() === bidPackageData[i].destination.toLowerCase()
        );

        console.log("User Admin Margin:", userAdminMargin);

        let finalMargin = { month_name: currentMonth, margin_percentage: "10" }; // Default value

        if (userAdminMargin) {
          const relevantUserMargin = userAdminMargin.month_and_margin_user.find((m) => m.month_name === currentMonth);

          if (relevantUserMargin) {
            finalMargin = relevantUserMargin; // Agar margin mil jaye toh use karein
          }
        }

        bidPackageData[i].admin_margin = finalMargin; // Admin margin assign karna
      }

      console.log(bidPackageData); // Final Output

      const display_agencys_all_review = await Bidschema.aggregate([
        {
          $match: { agency_id: { $in: bidPackageData.map((item) => mongoose.Types.ObjectId(item.agency_id)) } }
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

      console.log("Display Agency All Review:", display_agencys_all_review);

      const display_agencys_all_review_package = await packageSchema.aggregate([
        {
          $match: { user_id: { $in: bidPackageData.map((item) => mongoose.Types.ObjectId(item.agency_id)) } }
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

      console.log("Display Agency All Review:", display_agencys_all_review_package);

      const baseURL = "https://start-your-tour-api.onrender.com/images/agency/";

      let totalStars = 0;
      let totalReviews = 0;
      let agencyReviewsMap = {};

      // Helper function to update the review map
      const updateAgencyReviewMap = (data) => {
        for (const entry of data) {
          if (!entry.agency_id) continue; // 🛑 skip null or undefined agency_id

          const agencyId = entry.agency_id.toString(); // 🔐 safe conversion

          if (agencyReviewsMap[agencyId]) {
            agencyReviewsMap[agencyId].totalStars += entry.average_star * entry.total_reviews;
            agencyReviewsMap[agencyId].totalReviews += entry.total_reviews;
          } else {
            agencyReviewsMap[agencyId] = {
              totalStars: entry.average_star * entry.total_reviews,
              totalReviews: entry.total_reviews
            };
          }
        }
      };

      updateAgencyReviewMap(display_agencys_all_review);
      updateAgencyReviewMap(display_agencys_all_review_package);
      // Merge both sets of review data

      // Update bidPackageData with final review info
      for (const entry of bidPackageData) {
        if (!entry.agency_id) {
          entry.averageStarRating = 0;
          entry.totalReview = 0;
          continue;
        }

        const agencyId = entry.agency_id.toString();
        const reviewData = agencyReviewsMap[agencyId];

        if (reviewData) {
          entry.averageStarRating = reviewData.totalReviews > 0 ? reviewData.totalStars / reviewData.totalReviews : 0;
          entry.totalReview = reviewData.totalReviews;
        } else {
          entry.averageStarRating = 0;
          entry.totalReview = 0;
        }
      }

      // Step 3: Format the final data for the response
      const final_data = bidPackageData.map((element) => {
        const totalDays = element.total_days;
        const totalNights = element.total_nights;

        const marginPercentage = parseFloat(element.admin_margin.margin_percentage) || 0;

        // Calculate admin margin amount
        const adminMarginAmount = (element.total_amount * marginPercentage) / 100;

        // Calculate final total amount after adding admin margin
        const finalTotalAmount = element.total_amount + adminMarginAmount;

        return {
          _id: element._id,
          agency_id: element.agency_id,
          Price: element.price_per_person,
          name: element.name,
          destination: element.destination,
          bid_status: element.bid_status,
          price_per_person_infant: element.price_per_person_infant,
          price_per_person_child: element.price_per_person_child,
          price_per_person_adult: element.price_per_person_adult,
          package_valid_till_for_booking: element.package_valid_till_for_booking,
          room_sharing: element.room_sharing,
          admin_margin_amount: adminMarginAmount,
          total_amount: Math.round(finalTotalAmount),
          Date: element.bid_date1,
          start_date1: element.start_date1,
          end_date: element.end_date,
          Agency: element.agency_name,
          agency_logo: element.agency_logo ? `${baseURL}${element.agency_logo}` : "",
          TotalDays: totalDays,
          TotalNights: totalNights,
          breakfast_price: element.breakfast_price,
          lunch_price: element.lunch_price,
          dinner_price: element.dinner_price,
          HotelTypes: element.hotel_types,
          admin_margin: element.admin_margin,
          averageStarRating: element.averageStarRating, // Include average star rating
          totalReview: element.totalReview // Include total review count
        };
      });

      final_data.sort((a, b) => a.Agency.localeCompare(b.Agency));

      // Return the final data
      return this.sendJSONResponse(
        res,
        "bid package",
        {
          length: final_data.length
        },
        final_data
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async getbidDetails_jaydev(req, res) {
    try {
      const bid_id = req.query._id;

      if (!bid_id || `${bid_id}`.length !== 24) {
        console.log(`bid_id is empty ->${bid_id}`);
        throw new Error("bid_id is invalid");
        return;
      }

      const baseHotelPhotoURL = "https://start-your-tour-api.onrender.com/images/hotel_itienrary/";

      const packageProfitMargin = await package_profit_margin.find();

      const getbidDetails = await Bidschema.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(bid_id) }
        },
        {
          $lookup: {
            from: "itineries",
            localField: "_id",
            foreignField: "bid_id",
            as: "itineries",
            pipeline: [
              {
                $lookup: {
                  from: "hotel_itienraries",
                  localField: "hotel_itienrary_id",
                  foreignField: "_id",
                  as: "hotel_itienrary",
                  pipeline: [
                    {
                      $project: {
                        _id: 0, // Exclude the _id field
                        hotel_name: 1,
                        rooms: 1
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  hotel_name: { $arrayElemAt: ["$hotel_itienrary.hotel_name", 0] },
                  rooms: { $arrayElemAt: ["$hotel_itienrary.rooms", 0] }
                }
              },
              {
                $project: {
                  hotel_itienrary: 0
                }
              }
            ]
          }
        },
        {
          $set: {
            itineries: {
              $map: {
                input: "$itineries",
                as: "itinerary",
                in: {
                  $mergeObjects: [
                    "$$itinerary",
                    {
                      rooms: {
                        $filter: {
                          input: "$$itinerary.rooms",
                          as: "room",
                          cond: { $eq: ["$$room._id", "$$itinerary.room_id"] }
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
            from: "hotel_itienraries",
            localField: "itineries.hotel_itienrary_id",
            foreignField: "_id",
            as: "hotel_itienrary"
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
                                  input: "$itineries",
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
            localField: "destination_category",
            foreignField: "_id",
            as: "destination_category_name"
          }
        },
        {
          $lookup: {
            from: "agencypersonals",
            localField: "agency_id",
            foreignField: "user_id",
            as: "agency_details"
          }
        },
        {
          $project: {
            _id: 1,
            agency_id: 1,
            custom_requirement_id: 1,
            price_per_person: 1,
            bid_date: 1,
            total_days: 1,
            name: 1,
            total_adult: 1,
            total_child: 1,
            Infant: 1,
            total_nights: 1,
            departure: 1,
            destination: 1,
            travel_by: 1,
            sightseeing: 1,
            hotel_types: 1,
            meal_required: 1,
            package_type: 1,
            meal_types: 1,
            other_services_by_agency: 1,
            personal_care: 1,
            additional_requirement: 1,
            room_sharing: 1,
            total_amount: 1,
            start_date1: {
              $dateToString: { format: "%d/%m/%Y", date: "$start_date" }
            },
            end_date1: {
              $dateToString: { format: "%d/%m/%Y", date: "$end_date" }
            },
            destination_category: 1,
            exclude_services: 1,
            bid_status: 1,
            include_services: 1,
            itineries: 1,
            hotel_itienrary: 1,
            package_valid_till_for_booking: 1,
            price_per_person_infant: 1,
            price_per_person_child: 1,
            price_per_person_adult: 1,
            admin_margin: 1,
            admin_margin_price: 1,
            breakfast_price: 1,
            lunch_price: 1,
            dinner_price: 1,
            agency_name: { $arrayElemAt: ["$agency_details.agency_name", 0] },
            destination_category_name: {
              category_name: 1
            }
          }
        }
      ]);

      const display_agencys_all_review = await Bidschema.aggregate([
        {
          $match: { agency_id: mongoose.Types.ObjectId(getbidDetails[0].agency_id) }
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
          $match: { user_id: mongoose.Types.ObjectId(getbidDetails[0].agency_id) }
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

      console.log(display_agencys_all_review_package);

      let totalStars = 0;
      let totalReviews = 0;

      const combinedReviewStats = [...display_agencys_all_review, ...display_agencys_all_review_package];
      console.log(combinedReviewStats);

      for (const entry of combinedReviewStats) {
        totalStars += entry.average_star * entry.total_reviews;
        totalReviews += entry.total_reviews;
      }

      const averageStarRating = totalStars / totalReviews;
      const totalReview = totalReviews;

      getbidDetails[0].totalReview = totalReview;
      getbidDetails[0].averageStarRating = averageStarRating || 0;

      for (let i = 0; i < getbidDetails.length; i++) {
        // for (let j = 0; j < getbidDetails[i].travel_by.length; j++) {
        //     getbidDetails[i].travel_by[j] = {travel: getbidDetails[i].travel_by[j]}
        // }

        const [day, month, year] = getbidDetails[i].start_date1.split("/").map(Number);
        const startDateObject = new Date(year, month - 1, day); // month is 0-indexed in JavaScript

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
        const currentMonth = monthNames[startDateObject.getMonth()]; // Get the month name
        console.log(currentMonth);

        // const userAdminMargin = packageProfitMargin.find(margin => margin.state_name === getbidDetails[i].destination);

        // // Find the relevant user margin by filtering by month_and_margin_user (for users)
        // const relevantUserMargin = userAdminMargin ? userAdminMargin.month_and_margin_user.find(m => m.month_name === currentMonth) : null;

        // // Attach the admin margin if it exists
        // if (relevantUserMargin) {
        //   getbidDetails[i].admin_margin = relevantUserMargin;
        // } else {
        //   getbidDetails[i].admin_margin = "No margin found for this user";
        // }

        const userAdminMargin = packageProfitMargin.find(
          (margin) => margin.state_name === getbidDetails[i].destination
        );

        // If a match is found, find the margin for the current month
        if (userAdminMargin) {
          const relevantUserMargin = userAdminMargin.month_and_margin_user.find((m) => m.month_name === currentMonth);

          // If a margin is found for the current month, use it; otherwise, default to 0
          getbidDetails[i].admin_margin = relevantUserMargin || {
            month_name: currentMonth,
            margin_percentage: "10"
          };
        } else {
          // If no destination is found, set admin_margin to 0 for the current month
          getbidDetails[i].admin_margin = {
            month_name: currentMonth,
            margin_percentage: "10"
          };
        }

        var meal = getbidDetails[i].meal_required[0];
        for (let j = 1; j < getbidDetails[i].meal_required.length; j++) {
          meal = meal + "," + getbidDetails[i].meal_required[j];
        }
        getbidDetails[i].meal_required = meal;

        var types = getbidDetails[i].meal_types[0];
        for (let j = 1; j < getbidDetails[i].meal_types.length; j++) {
          types = types + "," + getbidDetails[i].meal_types[j];
        }
        getbidDetails[i].meal_types = types;
        var travel = getbidDetails[i].travel_by[0];
        for (let j = 1; j < getbidDetails[i].travel_by.length; j++) {
          travel = travel + "," + getbidDetails[i].travel_by[j];
        }
        getbidDetails[i].travel_by = travel;

        var category = getbidDetails[i].destination_category[0];
        for (let j = 1; j < getbidDetails[i].destination_category.length; j++) {
          category = category + "," + getbidDetails[i].destination_category[j];
        }
        getbidDetails[i].destination_category = category;
        var hotel = getbidDetails[i].hotel_types[0];
        for (let j = 1; j < getbidDetails[i].hotel_types.length; j++) {
          hotel = hotel + "," + getbidDetails[i].hotel_types[j];
        }
        getbidDetails[i].hotel_types = hotel;
        for (let j = 0; j < getbidDetails[i].include_services.length; j++) {
          getbidDetails[i].include_services[j] = { include_services_value: getbidDetails[i].include_services[j] };
        }
        for (let j = 0; j < getbidDetails[i].exclude_services.length; j++) {
          getbidDetails[i].exclude_services[j] = { exclude_services_value: getbidDetails[i].exclude_services[j] };
        }
        // for (let j = 0; j < getbidDetails[i].itineries.length; j++) {
        //   getbidDetails[i].itineries[j].photo =
        //     generateFileDownloadLinkPrefix(req.localHostURL) + getbidDetails[i].itineries[j].photo;
        // }
        for (let j = 0; j < getbidDetails[i].itineries.length; j++) {
          getbidDetails[i].itineries[j].photo = await image_url("itinary", getbidDetails[i].itineries[j].photo);
        }
      }
      // getbidDetails.forEach(element => {
      //     // element.travel_by = element.travel_by[0]
      //     element.meal_required = element.meal_required[0];
      //     element.meal_types = element.meal_types[0]
      // });

      // for (let i = 0; i < getbidDetails.length; i++) {
      //   const itineries = getbidDetails[i].itineries;
      //   if (itineries && Array.isArray(itineries)) {
      //     for (let j = 0; j < itineries.length; j++) {
      //       const currentItinerary = itineries[j];
      //       if (currentItinerary && currentItinerary.photo) {
      //         currentItinerary.photo = await image_url(fn, currentItinerary.photo);
      //       }
      //     }
      //   }
      // }

      return this.sendJSONResponse(
        res,
        "getbidDetails requiremnetdata retrived",
        {
          length: 1
        },
        getbidDetails
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_agency_bid_jaydev(req, res) {
    try {
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

      const display_agency_bid = await Bidschema.aggregate([
        {
          $match: { agency_id: mongoose.Types.ObjectId(tokenData.id) }
        },
        {
          $lookup: {
            from: "itineries",
            localField: "_id",
            foreignField: "bid_id",
            as: "itineries",
            pipeline: [
              {
                $lookup: {
                  from: "hotel_itienraries",
                  localField: "hotel_itienrary_id",
                  foreignField: "_id",
                  as: "hotel_itienrary",
                  pipeline: [
                    {
                      $project: {
                        _id: 0, // Exclude the _id field
                        hotel_name: 1,
                        rooms: 1
                      }
                    }
                  ]
                }
              },
              {
                $addFields: {
                  hotel_name: { $arrayElemAt: ["$hotel_itienrary.hotel_name", 0] },
                  rooms: { $arrayElemAt: ["$hotel_itienrary.rooms", 0] }
                }
              },
              {
                $project: {
                  hotel_itienrary: 0
                }
              }
            ]
          }
        },
        {
          $set: {
            itinerie: {
              $map: {
                input: "$itinerie",
                as: "itinerary",
                in: {
                  $mergeObjects: [
                    "$$itinerary",
                    {
                      rooms: {
                        $filter: {
                          input: "$$itinerary.rooms",
                          as: "room",
                          cond: { $eq: ["$$room._id", "$$itinerary.room_id"] }
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
          $addFields: {
            itineries: {
              $map: {
                input: "$itineries",
                as: "itinerary",
                in: {
                  $mergeObjects: [
                    "$$itinerary",
                    {
                      photo: {
                        $concat: [
                          image_url, // "/images/itinary/",
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
            localField: "destination_category",
            foreignField: "_id",
            as: "destination_category_name"
          }
        },
        {
          $lookup: {
            from: "custom_requirements",
            localField: "custom_requirement_id",
            foreignField: "_id",
            as: "customer_details"
          }
        },
        {
          $project: {
            "_id": 1,
            "agency_id": 1,
            "custom_requirement_id": 1,
            "price_per_person": 1,
            "bid_date": 1,
            "name": 1,
            "package_type": 1,
            "total_days": 1,
            "total_nights": 1,
            "travel_by": 1,
            "sightseeing": 1,
            "hotel_types": 1,
            "meal_required": 1,
            "meal_types": 1,
            "departure": 1,
            "destination": 1,
            "total_adult": 1,
            "total_child": 1,
            "Infant": 1,
            "include_details": 1,
            "start_date": 1,
            "end_date": 1,
            "destination_category": 1,
            "include_services": 1,
            "exclude_services": 1,
            "total_amount": 1,
            "bid_status": 1,
            "additional_requirement": 1,
            "package_valid_till_for_booking": 1,
            "createdAt": 1,
            "updatedAt": 1,
            // "__v": 1,
            "itineries": 1,
            "price_per_person_infant": 1,
            "price_per_person_child": 1,
            "price_per_person_adult": 1,
            "room_sharing": 1,
            "admin_margin": 1,
            "admin_margin_price": 1,
            "breakfast_price": 1,
            "lunch_price": 1,
            "dinner_price": 1,
            "destination_category_name": { category_name: 1 },
            "customer_details.full_name": 1 // Fetch full_name directly
            // "customer_details.package_valid_till_for_booking": 1, // Fetch full_name directly
          }
        },
        { $sort: { createdAt: -1 } }
      ]);

      for (let i = 0; i < display_agency_bid.length; i++) {
        const itineries = display_agency_bid[i].itineries;
        if (itineries && Array.isArray(itineries)) {
          for (let j = 0; j < itineries.length; j++) {
            const currentItinerary = itineries[j];
            if (currentItinerary && currentItinerary.photo) {
              currentItinerary.photo = await image_url(fn, currentItinerary.photo);
            }
          }
        }
      }
      return this.sendJSONResponse(
        res,
        "display bid Details",
        { length: display_agency_bid.length }, // Fix to get the correct length
        display_agency_bid
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async checkAndExpireBids(req, res) {
  //   try {
  //     const tokenData = req.userData;

  //     if (!tokenData) {
  //       return res.status(401).json({
  //         message: "Auth fail",
  //       });
  //     }

  //     const agencyId = tokenData.id;

  //     const bidsToExpire = await Bidschema.find({
  //       agency_id: agencyId,
  //       package_valid_till_for_booking: { $lt: new Date() },
  //       bid_status: { $nin: ["booked", "save", "reject"] },
  //     });

  //     console.log("bidsToExpire:", bidsToExpire)

  //     if (!bidsToExpire.length) {
  //       return res.status(200).json({ message: "No bids to expire." });
  //     }

  //     // Update the bid_status of the found bids to 'expired'
  //     await Bidschema.updateMany(
  //       {
  //         _id: { $in: bidsToExpire.map(bid => bid._id) },
  //       },
  //       { $set: { bid_status: "expired" } }
  //     );

  //     return res
  //       .status(200)
  //       .json({
  //         success: true,
  //         message: "Bid statuses updated successfully.",
  //       });

  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({ message: "Internal server error." });
  //   }
  // }

  async checkAndExpireBids(req, res) {
    try {
      const tokenData = req.userData;

      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }

      let bidsToExpire;

      if (tokenData.role === "agency") {
        // Agency-specific logic
        const agencyId = tokenData.id;

        bidsToExpire = await Bidschema.find({
          agency_id: agencyId,
          package_valid_till_for_booking: { $lt: new Date() },
          bid_status: { $nin: ["booked", "reject", "submit"] }
        });
      } else if (tokenData.role === "customer") {
        // User-specific logic
        const userId = tokenData.id;

        const customerRequirements = await customRequirementSchema.find({
          user_id: userId
        });

        console.log("customerRequirements:", customerRequirements);

        const customerRequirementIds = customerRequirements.map((requirement) => requirement._id);

        console.log("customerRequirementIds:", customerRequirementIds);

        bidsToExpire = await Bidschema.find({
          custom_requirement_id: { $in: customerRequirementIds },
          package_valid_till_for_booking: { $lt: new Date() },
          bid_status: { $nin: ["booked", "reject", "sabmit"] }
        });
      } else {
        return res.status(400).json({ message: "Invalid role." });
      }

      console.log("bidsToExpire:", bidsToExpire);

      if (!bidsToExpire.length) {
        return res.status(200).json({ message: "No bids to expire." });
      }

      // Update the bid_status of the found bids to 'expired'
      await Bidschema.updateMany(
        {
          _id: { $in: bidsToExpire.map((bid) => bid._id) }
        },
        { $set: { bid_status: "expired" } }
      );

      return res.status(200).json({
        success: true,
        message: "Bid statuses updated successfully."
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }
};
