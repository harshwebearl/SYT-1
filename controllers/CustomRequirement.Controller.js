const BaseController = require("./BaseController");
const niv = require("node-input-validator");
const customRequirementSchema = require("../models/custom_requirementsSchema");
const AdminSchema = require("../models/AdminSchema");
const agencySchema = require("../models/Agency_personalSchema");
const NotFound = require("../errors/NotFound");
const Forbidden = require("../errors/Forbidden");
const bidSchema = require("../models/bidSchema");
const customerSchema = require("../models/customerSchema");
const userSchema = require("../models/usersSchema");
const sendNotification = require("../config/firebase/firebaseAdmin");
const mongoose = require("mongoose");
const Notificationschema = require("../models/NotificationSchema");
const { getReceiverSocketId, io } = require("../socket/socket");
const QuillDeltaToHtmlConverter = require("quill-delta-to-html").QuillDeltaToHtmlConverter;
module.exports = class CustomRequirements extends BaseController {
  // async AddRequirements(req, res) {
  //   try {
  //     const tokenData = req.userData;
  //     if (tokenData === "") {
  //       return res.status(401).json({
  //         message: "Auth fail"
  //       });
  //     }
  //     const userData = await userSchema.find({_id:tokenData.id});
  //     if (userData[0].role !== "customer") {
  //       throw new Forbidden("you are not customer");
  //     }
  //     // const objectValidator = niv.Validator(req.body,{
  //     //     departure: 'required',
  //     //     destination: 'required',
  //     //     category: 'required',
  //     //     Infant: 'required',
  //     //     travel_by: 'required',
  //     //     start_date: 'required',
  //     //     end_date: 'required',
  //     //     tour_days: 'required',
  //     //     total_travel_days: 'required',
  //     //     hotel_type: 'required',
  //     //     meal_require: 'required',
  //     //     meal_type: 'required',
  //     //     additional_requirement: 'required',
  //     //     user_id: 'required',
  //     //     full_name: 'required',
  //     //     email_address: 'required',
  //     //     mobile_no: 'required',
  //     //     city: 'required',
  //     //     budget_per_person: 'required'
  //     // });

  //     // const matched = await objectValidator.check();

  //     // if(!matched){
  //     //     throw new Forbidden('Validation Error');
  //     // }

  //     const requirement = {
  //       departure: req.body.departure,
  //       destination: req.body.destination,
  //       category: req.body.category,
  //       total_adult: req.body.total_adult,
  //       total_child: req.body.total_child,
  //       Infant: req.body.Infant,
  //       personal_care: req.body.personal_care,
  //       travel_by: req.body.travel_by,
  //       start_date: req.body.start_date,
  //       end_date: req.body.end_date,
  //       total_travel_days: req.body.total_travel_days,
  //       sightseeing: req.body.sightseeing, // Including 'sightseeing' field
  //       hotel_type: req.body.hotel_type,
  //       meal_require: req.body.meal_require,
  //       meal_type: req.body.meal_type,
  //       additional_requirement: req.body.additional_requirement,
  //       user_id: tokenData.id,
  //       full_name: req.body.full_name,
  //       email_address: req.body.email_address,
  //       mobile_no: req.body.mobile_no,
  //       state: req.body.state,
  //       city: req.body.city,
  //       budget_per_person: req.body.budget_per_person
  //     };
  //     const requirementData = new customRequirementSchema(requirement);
  //     const UserRequirements = await requirementData.save();
  //     const Agency_Display_notification = await agencySchema.aggregate([
  //       {
  //         $project: {
  //           _id: 1,
  //           full_name: 1,
  //           notificationTokens: 1
  //         }
  //       }
  //     ]);

  //     for (let i = 0; i < Agency_Display_notification.length; i++) {
  //       const element = Agency_Display_notification[i];
  //       console.log(element);
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
  //               body: `Added New Customrequirement`
  //             },
  //             data: {
  //               title: "Notification",
  //               body: `Added New Customrequirement`,
  //               message: "Message"
  //             }
  //           },
  //           element?.email_address
  //         );
  //       }
  //     }
  //     //   console.log(notification);

  //     this.sendJSONResponse(
  //       res,
  //       "user requirement is added",
  //       {
  //         length: 1
  //       },
  //       UserRequirements
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async AddRequirements(req, res) {
    try {
      const tokenData = req.userData;
      console.log("Token Data:", tokenData); // Log token data for debugging

      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }

      const userData = await userSchema.findById(tokenData.id);
      console.log("User Data:", userData); // Log user data for debugging

      if (!userData) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      if (userData.role !== "customer") {
        throw new Forbidden("You are not a customer");
      }

      let hotel_type = req.body.hotel_type;
      if (Array.isArray(hotel_type)) {
        hotel_type = hotel_type.sort();
      }

      const requirement = {
        departure: req.body.departure,
        destination: req.body.destination,
        category: req.body.category,
        total_adult: req.body.total_adult,
        total_child: req.body.total_child,
        Infant: req.body.Infant,
        personal_care: req.body.personal_care,
        travel_by: req.body.travel_by,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        total_travel_days: req.body.total_travel_days,
        sightseeing: req.body.sightseeing, // Including 'sightseeing' field
        hotel_type: hotel_type,
        meal_require: req.body.meal_require,
        meal_type: req.body.meal_type,
        additional_requirement: req.body.additional_requirement,
        user_id: tokenData.id,
        full_name: req.body.full_name,
        email_address: req.body.email_address,
        mobile_no: req.body.mobile_no,
        state: req.body.state,
        city: req.body.city,
        budget_per_person: req.body.budget_per_person
        // package_valid_till_for_booking: req.body.package_valid_till_for_booking
      };

      const requirementData = new customRequirementSchema(requirement);
      const UserRequirements = await requirementData.save();

      let user = await customerSchema.findOne({ user_id: userData._id });

      let notificationData = await Notificationschema.create({
        user_id: tokenData.id,
        title: "Your Travel Requirement Has Been Added!",
        text: `Hello ${user.name}, your travel request from ${req.body.departure} to ${req.body.destination} has been successfully submitted for the dates ${req.body.start_date} to ${req.body.end_date}. Our team will review your requirements and reach out to you shortly. Thank you for choosing us for your journey!`,
        user_type: "customer"
      });

      const customeradminSocketId = getReceiverSocketId(tokenData.id);
      if (customeradminSocketId) {
        io.to(customeradminSocketId).emit("newNotification", notificationData);
      }

      let agencyNotificationData = await Notificationschema.create({
        title: "New Travel Requirement Available!",
        text: `A new travel requirement from ${req.body.departure} to ${req.body.destination} has been added. Please review the details and place a bid if interested.`,
        user_type: "agency"
      });

      io.emit("newNotification", { agencyNotificationData });

      const Agency_Display_notification = await agencySchema.aggregate([
        {
          $project: {
            _id: 1,
            full_name: 1,
            notificationTokens: 1
          }
        }
      ]);

      for (let i = 0; i < Agency_Display_notification.length; i++) {
        const element = Agency_Display_notification[i];
        console.log("Agency Notification Element:", element); // Log agency notifications for debugging

        if (
          element?.notificationTokens &&
          element?.notificationTokens?.deviceType &&
          element?.notificationTokens?.deviceToken
        ) {
          sendNotification(
            element.notificationTokens.deviceType,
            element.notificationTokens.deviceToken,
            {
              notification: {
                title: "Notification",
                body: "Added New Custom Requirement"
              },
              data: {
                title: "Notification",
                body: "Added New Custom Requirement",
                message: "Message"
              }
            },
            element.email_address
          );
        }
      }

      this.sendJSONResponse(
        res,
        "User requirement is added",
        {
          length: 1
        },
        UserRequirements
      );
    } catch (error) {
      console.log("Error:", error); // Log errors for debugging
      if (error instanceof NotFound) {
        console.log("Not Found Error:", error); // Log NotFound error for debugging
      }
      return this.sendErrorResponse(req, res, error.message);
    }
  }

  async UpdateRequirements(req, res) {
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

      const custom_requirement_id = req.query.c_id;
      const data = {
        departure: req.body.departure,
        destination: req.body.destination,
        category: req.body.category,
        total_adult: req.body.total_adult,
        total_child: req.body.total_child,
        Infant: req.body.Infant,
        personal_care: req.body.personal_care,
        travel_by: req.body.travel_by,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        total_travel_days: req.body.total_travel_days,
        sightseeing: req.body.sightseeing,
        hotel_type: req.body.hotel_type,
        meal_require: req.body.meal_require,
        meal_type: req.body.meal_type,
        additional_requirement: req.body.additional_requirement,
        full_name: req.body.full_name,
        email_address: req.body.email_address,
        mobile_no: req.body.mobile_no,
        state: req.body.state,
        city: req.body.city,
        budget_per_person: req.body.budget_per_person
      };
      const updatedData = await customRequirementSchema.findByIdAndUpdate(
        { _id: custom_requirement_id, user_id: tokenData.id },
        data
      );
      return this.sendJSONResponse(
        res,
        "customrequirement updated",
        {
          length: 1
        },
        "custom requirement updated"
      );
    } catch (error) {
      console.log(error);
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // async getRequirment(req, res) {
  //   try {
  //     // console.log("123");
  //     const tokenData = req.userData;

  //     // console.log(tokenData);
  //     const requirementData = await customRequirementSchema.aggregate([
  //       {
  //         $match: { user_id: mongoose.Types.ObjectId(tokenData.id) }
  //       },
  //       {
  //         $lookup: {
  //           from: "destination_categories",
  //           localField: "category",
  //           foreignField: "_id",
  //           as: "Destination_category"
  //         }
  //       },
  //       // {"$sort":{"requirementData":-1}},

  //       // {
  //       //     $lookup:{
  //       //         from: 'destinations',
  //       //         localField: 'destination',
  //       //         foreignField: '_id',
  //       //         as: 'Destination'
  //       //     }
  //       // },
  //       {
  //         $lookup: {
  //           from: "destinations",
  //           localField: "destination",
  //           foreignField: "destination_name",
  //           as: "Destination"
  //         }
  //       },
  //       {
  //         $unwind: {
  //           path: "$Destination",
  //           preserveNullAndEmptyArrays: true
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "place_to_visits",
  //           localField: "Destination._id",
  //           foreignField: "destination_id",
  //           as: "Places_to_visit"
  //         }
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           departure: 1,
  //           destination: 1,
  //           total_adult: 1,
  //           total_child: 1,
  //           Infant: 1,
  //           personal_care: 1,
  //           travel_by: 1,
  //           // start_date:1,
  //           start_date1: { $dateToString: { format: "%d/%m/%Y", date: "$start_date" } },
  //           // end_date:1,
  //           end_date1: { $dateToString: { format: "%d/%m/%Y", date: "$end_date" } },
  //           total_travel_days: 1,
  //           hotel_type: 1,
  //           sightseeing: 1,
  //           meal_require: 1,
  //           meal_type: 1,
  //           status: 1,
  //           full_name: 1,
  //           email_address: 1,
  //           mobile_no: 1,
  //           city: 1,
  //           state: 1,
  //           additional_requirement: 1,
  //           // package_valid_till_for_booking: 1,
  //           Destination_category: {
  //             category_name: 1
  //           },
  //           // Destination: {
  //           //   destination_name: 1
  //           // },
  //           // Places_to_visit: {
  //           //   photo: 1,
  //           // },
  //           Places_to_visit: { $arrayElemAt: ["$Places_to_visit.photo", 0] }

  //         }
  //       }
  //     ]);
  //     console.log(requirementData);
  //     if (requirementData === null) {
  //       throw new NotFound("Coustom requirement PackageData Not Found");
  //     }
  //     // console.log(requirementData);
  //     for (let i = 0; i < requirementData.length; i++) {
  //       // for (let j = 0; j < requirementData[i].travel_by.length; j++) {
  //       //     requirementData[i].travel_by[j] = {travel:requirementData[i].travel_by[j]};
  //       // }
  //       // requirementData[i].travel_by = requirementData[i].travel_by[0]
  //       var travel = requirementData[i].travel_by[0];
  //       for (let j = 1; j < requirementData[i].travel_by.length; j++) {
  //         travel = travel + "," + requirementData[i].travel_by[j];
  //         console.log(travel);
  //       }
  //       requirementData[i].travel_by = travel;
  //       var hotel = requirementData[i].hotel_type[0];
  //       for (let j = 1; j < requirementData[i].hotel_type.length; j++) {
  //         hotel = hotel + requirementData[i].hotel_type[j];
  //       }
  //       requirementData[i].hotel_type = hotel;
  //       var meal = requirementData[i].meal_require[0];
  //       for (let j = 1; j < requirementData[i].meal_require.length; j++) {
  //         meal = meal + "," + requirementData[i].meal_require[j];
  //       }
  //       requirementData[i].meal_require = meal;
  //       var category = requirementData[i].Destination_category[0].category_name;
  //       for (let j = 1; j < requirementData[i].Destination_category.length; j++) {
  //         category = category + "," + requirementData[i].Destination_category[j].category_name;
  //       }
  //       requirementData[i].Destination_category = category;
  //     }
  //     const baseURL = "https://start-your-tour-api.onrender.com/images/placephoto/";
  //     const final_result = [];
  //     requirementData.forEach((element) => {
  //       final_result.push({
  //         Trip_id: element._id,
  //         departure: element.departure,
  //         Arival: element.destination,
  //         place_to_visit_photo: `${baseURL}${element.Places_to_visit}`,
  //         // Arival: element.Destination[0].destination_name,
  //         On_Date: element.start_date1 + " - " + element.end_date1,
  //         custom_requirement: element,
  //       });
  //     });

  //     final_result.sort().reverse();

  //     // const convertjson = new QuillDeltaToHtmlConverter([{"insert": "Hello World", "attributes": {"bold": true}}, {"insert": "\nHow are you"}, {"insert": "\n", "attributes": {"header": 1}}, {"insert": "Webearl" }, {"insert": "\n", "attributes": {"list": "ordered"}}, {"insert": "Technology" }, {"insert": "\n", "attributes": {"list": "ordered"}}])

  //     // console.log(convertjson);

  //     // var html = convertjson.convert();
  //     // console.log(html);
  //     // const desantingorder = { final_result: -1}
  //     return this.sendJSONResponse(
  //       res,
  //       "Requiremnetdata retrived",
  //       {
  //         length: 1
  //       },
  //       final_result
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  // async getRequirment(req, res) {
  //   try {
  //     const tokenData = req.userData;

  //     const requirementData = await customRequirementSchema.aggregate([
  //       {
  //         $match: { user_id: mongoose.Types.ObjectId(tokenData.id) }
  //       },
  //       {
  //         $lookup: {
  //           from: "destination_categories",
  //           localField: "category",
  //           foreignField: "_id",
  //           as: "Destination_category"
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "destinations",
  //           localField: "destination",
  //           foreignField: "destination_name",
  //           as: "Destination"
  //         }
  //       },
  //       {
  //         $unwind: {
  //           path: "$Destination",
  //           preserveNullAndEmptyArrays: true
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "place_to_visits",
  //           localField: "Destination._id",
  //           foreignField: "destination_id",
  //           as: "Places_to_visit"
  //         }
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           departure: 1,
  //           destination: 1,
  //           total_adult: 1,
  //           total_child: 1,
  //           Infant: 1,
  //           personal_care: 1,
  //           travel_by: 1,
  //           start_date1: { $dateToString: { format: "%d/%m/%Y", date: "$start_date" } },
  //           end_date1: { $dateToString: { format: "%d/%m/%Y", date: "$end_date" } },
  //           total_travel_days: 1,
  //           hotel_type: 1,
  //           sightseeing: 1,
  //           meal_require: 1,
  //           meal_type: 1,
  //           status: 1,
  //           full_name: 1,
  //           email_address: 1,
  //           mobile_no: 1,
  //           city: 1,
  //           state: 1,
  //           additional_requirement: 1,
  //           Destination_category: {
  //             category_name: 1
  //           },
  //           Places_to_visit: {
  //             photo: 1
  //           }
  //         }
  //       }
  //     ]);

  //     if (requirementData === null) {
  //       throw new NotFound("Custom requirement PackageData Not Found");
  //     }

  //     for (let i = 0; i < requirementData.length; i++) {
  //       // for (let j = 0; j < requirementData[i].travel_by.length; j++) {
  //       //     requirementData[i].travel_by[j] = {travel:requirementData[i].travel_by[j]};
  //       // }
  //       // requirementData[i].travel_by = requirementData[i].travel_by[0]
  //       var travel = requirementData[i].travel_by[0];
  //       for (let j = 1; j < requirementData[i].travel_by.length; j++) {
  //         travel = travel + "," + requirementData[i].travel_by[j];
  //         console.log(travel);
  //       }
  //       requirementData[i].travel_by = travel;
  //       var hotel = requirementData[i].hotel_type[0];
  //       for (let j = 1; j < requirementData[i].hotel_type.length; j++) {
  //         hotel = hotel + requirementData[i].hotel_type[j];
  //       }
  //       requirementData[i].hotel_type = hotel;
  //       var meal = requirementData[i].meal_require[0];
  //       for (let j = 1; j < requirementData[i].meal_require.length; j++) {
  //         meal = meal + "," + requirementData[i].meal_require[j];
  //       }
  //       requirementData[i].meal_require = meal;
  //       var category = requirementData[i].Destination_category[0].category_name;
  //       for (let j = 1; j < requirementData[i].Destination_category.length; j++) {
  //         category = category + "," + requirementData[i].Destination_category[j].category_name;
  //       }
  //       requirementData[i].Destination_category = category;
  //     }

  //     // Processing data for display
  //     const baseURL = "https://start-your-tour-api.onrender.com/images/placephoto/";
  //     const defaultPhoto = "";
  //     const final_result = [];

  //     requirementData.forEach((element) => {
  //       const placePhotos = element.Places_to_visit.length
  //         ? element.Places_to_visit.map((place) => `${baseURL}${place.photo}`)
  //         : [defaultPhoto];

  //       // Remove Places_to_visit field from custom_requirement
  //       const { Places_to_visit, ...custom_requirement } = element;

  //       final_result.push({
  //         Trip_id: element._id,
  //         departure: element.departure,
  //         Arival: element.destination,
  //         place_to_visit_photo: placePhotos[0] || "",
  //         On_Date: element.start_date1 + " - " + element.end_date1,
  //         custom_requirement: custom_requirement
  //       });
  //     });

  //     final_result.sort().reverse();

  //     return this.sendJSONResponse(
  //       res,
  //       "Requirement data retrieved",
  //       {
  //         length: final_result.length
  //       },
  //       final_result
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error);
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }


  async getRequirment(req, res) {
    try {
      const tokenData = req.userData;

      const requirementData = await customRequirementSchema.aggregate([
        {
          $match: { user_id: mongoose.Types.ObjectId(tokenData.id) }
        },
        {
          $lookup: {
            from: "destination_categories",
            localField: "category",
            foreignField: "_id",
            as: "Destination_category"
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
            as: "Places_to_visit"
          }
        },
        {
          $lookup: {
            from: "bids",
            localField: "_id",
            foreignField: "custom_requirement_id",
            as: "bids"
          }
        },
        {
          $project: {
            _id: 1,
            departure: 1,
            destination: 1,
            total_adult: 1,
            total_child: 1,
            Infant: 1,
            personal_care: 1,
            travel_by: 1,
            start_date1: { $dateToString: { format: "%d/%m/%Y", date: "$start_date" } },
            end_date1: { $dateToString: { format: "%d/%m/%Y", date: "$end_date" } },
            total_travel_days: 1,
            hotel_type: 1,
            sightseeing: 1,
            meal_require: 1,
            meal_type: 1,
            status: 1,
            full_name: 1,
            email_address: 1,
            mobile_no: 1,
            city: 1,
            state: 1,
            additional_requirement: 1,
            Destination_category: {
              category_name: 1
            },
            Places_to_visit: {
              photo: 1
            },
            bid_count: {
              $size: {
                $filter: {
                  input: "$bids",
                  as: "bid",
                  cond: { $ne: ["$$bid.bid_status", "save"] }
                }
              }
            }
          }
        }
      ]);

      if (requirementData === null) {
        throw new NotFound("Custom requirement PackageData Not Found");
      }

      for (let i = 0; i < requirementData.length; i++) {
        var travel = requirementData[i].travel_by[0];
        for (let j = 1; j < requirementData[i].travel_by.length; j++) {
          travel = travel + "," + requirementData[i].travel_by[j];
        }
        requirementData[i].travel_by = travel;
        var hotel = requirementData[i].hotel_type[0];
        for (let j = 1; j < requirementData[i].hotel_type.length; j++) {
          hotel = hotel + requirementData[i].hotel_type[j];
        }
        requirementData[i].hotel_type = hotel;
        var meal = requirementData[i].meal_require[0];
        for (let j = 1; j < requirementData[i].meal_require.length; j++) {
          meal = meal + "," + requirementData[i].meal_require[j];
        }
        requirementData[i].meal_require = meal;
        var category = requirementData[i].Destination_category[0].category_name;
        for (let j = 1; j < requirementData[i].Destination_category.length; j++) {
          category = category + "," + requirementData[i].Destination_category[j].category_name;
        }
        requirementData[i].Destination_category = category;
      }

      // Processing data for display
      const baseURL = "https://syt-i471.onrender.com/images/placephoto/";
      const defaultPhoto = "";
      const final_result = [];

      requirementData.forEach((element) => {
        const placePhotos = element.Places_to_visit.length
          ? element.Places_to_visit.map((place) => `${baseURL}${place.photo}`)
          : [defaultPhoto];

        // Remove Places_to_visit field from custom_requirement
        const { Places_to_visit, ...custom_requirement } = element;

        final_result.push({
          Trip_id: element._id,
          departure: element.departure,
          Arival: element.destination,
          place_to_visit_photo: placePhotos[0] || "",
          On_Date: element.start_date1 + " - " + element.end_date1,
          bid_count: element.bid_count, // <-- Add bid count here
          custom_requirement: custom_requirement
        });
      });

      final_result.sort().reverse();

      return this.sendJSONResponse(
        res,
        "Requirement data retrieved",
        {
          length: final_result.length
        },
        final_result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error);
      }
      return this.sendErrorResponse(req, res, error);
    }
  }


  // async Agencyshowrequirements(req,res){
  //     try {
  //         const tokenData = req.userData;

  //         const AgencyData = await agencySchema.find({_id:tokenData.id})
  //         if(AgencyData.length === 0){
  //             throw new NotFound('Agencydata not found')
  //         }
  //         const requirementData = await customRequirementSchema.aggregate([
  //             {
  //                 $addFields:{
  //                     daysCount:{
  //                         $round:{ $divide: [{ $subtract: ["$end_date",new Date()]},86400000]}
  //                     }
  //                 }
  //             },
  //             {
  //                 $match:{
  //                     $and:[{daysCount:{$gte:0}},{status:true}]
  //                 }
  //             }
  //         ]);
  //         const bidData = await bidSchema.find({agency_id:tokenData.id});
  //         // console.log(bidData);

  //         const result = [];
  //         requirementData.forEach(element => {
  //             for (let index = 0; index < bidData.length; index++) {
  //                 if(element._id !== bidData[index].custom_requirement_id){
  //                     console.log(1);
  //                     result.push(element)
  //                 }
  //             }
  //         });
  //         if(requirementData === null){
  //             throw new NotFound('Custom requirement PackageData Not Found');
  //         }
  //         return this.sendJSONResponse(
  //             res,
  //             "Requiremnetdata retrived",
  //             {
  //                 length:1
  //             },
  //             requirementData
  //         );
  //     } catch (error) {
  //         if(error instanceof NotFound){
  //             console.log(error); // throw error;
  //         }
  //         return this.sendErrorResponse(req, res, error);
  //     }
  // }

  // /////////////////////
  async Agencyshowrequirements(req, res) {
    try {
      // const tokenData = req.userData;

      // const AgencyData = await agencySchema.find({ _id: tokenData.id });
      // if (AgencyData.length === 0) {
      //   throw new NotFound("Agencydata not found");
      // }

      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData);
      if (userData[0].role !== "agency") {
        throw new Forbidden("You are not authorized as an agency.");
      }

      // const requirementData = await customRequirementSchema.find().sort({ createdAt: -1 });
      // const agencyBids = await bidSchema.find({ agency_id: tokenData.id }).select('custom_requirement_id');

      const agencyBids = await bidSchema.find({ agency_id: tokenData.id }).select("custom_requirement_id");
      const agencyBidRequirementIds = agencyBids.map((bid) => bid.custom_requirement_id.toString());

      const currentDate = new Date();

      console.log("Current Date:", currentDate); // Log current date for debugging

      const requirementData = await customRequirementSchema
        .find({
          _id: { $nin: agencyBidRequirementIds },
          status: { $ne: "cancel by user" },
          end_date: { $gte: currentDate } // <-- Filter for non-expired requirements
        })
        .sort({ createdAt: -1 });

      if (!requirementData.length) {
        return res.status(200).json({
          success: true,
          message: "Custom requirement package data not found.",
          data: []
        });
      }
      return this.sendJSONResponse(
        res,
        "Requirement data retrieved",
        {
          length: requirementData.length
        },
        requirementData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // // Define the function for displaying requirements for an agency
  // async Agencyshowrequirements(req, res) {
  //   try {
  //     // Retrieve user data from request
  //     const tokenData = req.userData;

  //     // Check if user is authenticated
  //     if (tokenData === "") {
  //       return res.status(401).json({
  //         message: "Authentication failed"
  //       });
  //     }

  //     // Find user data in database
  //     const userData = await userSchema.find({ _id: tokenData.id });

  //     // Check if user data is not found
  //     if (userData.length === 0) {
  //       throw new NotFound("User data not found");
  //     }

  //     // Check if user role is agency
  //     if (userData[0].role !== "agency") {
  //       throw new Forbidden("You are not an agency");
  //     }

  //     // Check if the agency has already added a bid for this user
  //     const existingBid = await bidSchema.findOne({ user_id: tokenData.id });

  //     // Retrieve custom requirement data with bids for each requirement
  //     const requirementData = await customRequirementSchema.aggregate([
  //       {
  //         $lookup: {
  //           from: "bids",
  //           localField: "_id",
  //           foreignField: "custom_requirement_id",
  //           as: "bids"
  //         }
  //       }
  //     ]);

  //     // Check if requirement data is not found
  //     if (requirementData.length === 0) {
  //       throw new NotFound("Custom requirement data not found");
  //     }

  //     // Array to store matched requirements with bids
  //     const matchedRequirements = [];

  //     // Loop through requirement data to find matching requirements
  //     for (const requirement of requirementData) {
  //       // Check if the custom requirement ID matches the user's token ID and agency's custom requirement ID
  //       if (userData[0].custom_requirement_id !== null && requirement._id === userData[0].custom_requirement_id) {
  //         // Check if there are no matching bids for this requirement or existingBid is null
  //         const matchingBid = existingBid && requirement.bids.find(bid => bid._id === existingBid._id);
  //         if (!matchingBid) {
  //           // Add the requirement along with its associated bids to the matchedRequirements array
  //           matchedRequirements.push({
  //             requirement: requirement,
  //             bids: requirement.bids
  //           });
  //         }
  //       }
  //     }

  //     // Send response with matched requirement data and associated bids
  //     return res.status(200).json({
  //       message: "Matched requirement data retrieved successfully",
  //       length: matchedRequirements.length,
  //       data: matchedRequirements
  //     });
  //   } catch (error) {
  //     // Handle errors
  //     if (error instanceof NotFound || error instanceof Forbidden) {
  //       console.log(error); // Log the error
  //     }
  //     return res.status(error.status || 500).json({ error: error.message });
  //   }
  // }

  async showreqiurementpackageAdmin(req, res) {
    try {
      const tokenData = req.userData;
      console.log(tokenData);
      const adminData = await userSchema.find({ _id: tokenData.id });
      if (adminData.length === 0) {
        throw new Forbidden("you are not show display data");
      }
      const requirementData = await customRequirementSchema.aggregate([
        {
          $lookup: {
            from: "bids",
            localField: "_id",
            foreignField: "custom_requirement_id",
            as: "bids"
          }
        },
        {
          $project: {
            _id: 1,
            departure: 1,
            destination: 1,
            category: 1,
            total_adult: 1,
            total_child: 1,
            Infant: 1,
            personal_care: 1,
            travel_by: 1,
            start_date: 1,
            end_date: 1,
            total_travel_days: 1,
            sightseeing: 1,
            hotel_type: 1,
            meal_require: 1,
            meal_type: 1,
            additional_requirement: 1,
            user_id: 1,
            full_name: 1,
            email_address: 1,
            mobile_no: 1,
            state: 1,
            city: 1,
            budget_per_person: 1,
            status: 1,
            full_name: 1,
            email_address: 1,
            mobile_no: 1,
            // package_valid_till_for_booking: 1,
            bids: 1,
            bid_count: {
              $size: { $ifNull: ["$bids", []] }
            }
          }
        }
      ]);

      if (requirementData === null) {
        return res.status(200).json({
          success: true,
          message: "custom requirement PackageData Not Found",
          data: []
        });
        // throw new NotFound("custom requirement PackageData Not Found");
      }
      return this.sendJSONResponse(
        res,
        "Requiremnetdata retrived",
        {
          length: 1
        },
        requirementData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async DeleteCustompackage(req, res) {
    try {
      // const tokenData = req.userData;
      // const userData = await userSchema.find({ _id: tokenData.id });
      // if (userData.length === 0) {
      //   throw new Forbidden("you are not user");
      // }
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

      const id = req.query._id;
      const UpdatedData = await customRequirementSchema.findByIdAndUpdate(
        { user_id: tokenData.id, _id: id },
        { status: "cancel by user" }
      );
      return this.sendJSONResponse(
        res,
        "Custompackage is updated",
        {
          length: 1
        },
        UpdatedData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async getCustomRequirementById_agency(req, res) {
    try {
      const id = req.query._id;
      console.log(id);

      const display = await customRequirementSchema.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: "destination_categories",
            localField: "category",
            foreignField: "_id",
            as: "destination_category"
          }
        }
      ]);
      return this.sendJSONResponse(
        res,
        "Custompackage is display",
        {
          length: 1
        },
        display
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
