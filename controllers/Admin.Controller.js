const mongoose = require("mongoose");
// console.log(mongoose.Types.ObjectId.isValid('53cb6b9b4f4ddef1ad47f943'));

const BaseController = require("./BaseController");
const AdminSchema = require("../models/AdminSchema");
const UserSchema = require("../models/customerSchema");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const createToken = require("../helper/jwt");
const jwt = require("jsonwebtoken");
const agencySchema = require("../models/Agency_personalSchema");
const niv = require("node-input-validator");
const userschema = require("../models/usersSchema");
const req_data = require("../Top5.js");
const req_data2 = require("../Top5Dest.js");
const bookpackageschema = require("../models/bookpackageschema");
const customRequirementSchema = require("../models/custom_requirementsSchema");
const bcrypt = require("bcrypt");
const Otp = require("../models/otp.js");
const axios = require("axios");
// const package = require("../models/packageSchema");
const packageSchema = require("../models/PackageSchema.js");

module.exports = class AdminController extends BaseController {
  //add admins from super admin
  async createAdmin(req, res) {
    try {
      const tokenData = req.userData;
      const hash = await bcrypt.hash(req.body.password, 10);
      const usersData = {
        phone: req.body.phone,
        password: hash,
        // contect_no: req.body.contect_no,
        role: "admin",
        status: req.body.status
      };
      if (req.body?.is_subadmin) {
        usersData.is_subadmin = req.body.is_subadmin;
      }
      if (tokenData?.id) {
        usersData.admin_id = tokenData.id;
      }
      const schemaData = await userschema.find({
        phone: usersData.phone,
        role: usersData.role
      });
      if (schemaData.length !== 0) {
        throw new Forbidden("Data is Already Registered");
      }
      const InsertUsersData = new userschema(usersData);
      const users_data = await InsertUsersData.save();

      // const mobile_number = req.body.mobile_number;
      // const adminData = await AdminSchema.find({ mobile_number: mobile_number });

      // if (adminData.length !== 0) {
      //   throw new NotFound("admin is already exist");
      // }

      // const objValidator = new niv.Validator(req.body, {
      //   user_name: "required",
      //   mobile_number: "required",
      //   password: "required"
      // });

      // const matched = await objValidator.check();

      // if (!matched) {
      //   throw new Forbidden("Validation Error");
      // }
      const data = {
        user_name: req.body.user_name,
        email_address: req.body.email_address,
        user_id: users_data.id
        // mobile_number: req.body.mobile_number,
        // password: req.body.password,
        // email_address: req.body.email_address
      };
      // console.log(data);
      const insertData = new AdminSchema(data);
      const insertedData = await insertData.save();
      console.log(insertedData);

      return this.sendJSONResponse(
        res,
        "admin register successfully",
        {
          length: 1
        },
        insertedData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  //display admin lists
  async getAdmin(req, res) {
    try {
      const getAdminData = await AdminSchema.find({ admin_status: 0 });
      if (getAdminData.length === 0) {
        throw new NotFound("no admin found");
      }
      return this.sendJSONResponse(
        res,
        "admin retrived",
        {
          length: 1
        },
        getAdminData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // update admin info
  async updateAdmin(req, res) {
    try {
      const id = req.params.id;
      const data = {
        password: req.body.new_password
      };
      const oldData = await AdminSchema.find({ _id: id, password: req.body.old_password });

      if (oldData.length === 0) {
        throw new Forbidden("please enter write password");
      }

      const updateAdmin = await AdminSchema.updateOne({ _id: id }, data);
      return this.sendJSONResponse(
        res,
        "password and user name is updated",
        {
          length: 1
        },
        updateAdmin
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // Ensure bcrypt is imported

  // async updateAdmin(req, res) {
  //   try {
  //     const id = req.params.id;
  //     const { old_password, new_password } = req.body; // Destructure old and new passwords from request body

  //     // Fetch the admin's current data by ID
  //     const adminData = await AdminSchema.findById(id);
  //     if (!adminData) {
  //       throw new NotFound("Admin not found");
  //     }

  //     // Check if both passwords are provided
  //     if (!old_password || !new_password) {
  //       throw new Error("Both old and new passwords are required");
  //     }

  //     // Compare the provided old password with the stored hashed password
  //     const isOldPasswordValid = await bcrypt.compare(old_password, adminData.password);
  //     if (!isOldPasswordValid) {
  //       throw new Forbidden("Please enter the correct password");
  //     }

  //     // Hash the new password before saving
  //     const hashedNewPassword = await bcrypt.hash(new_password, 10); // 10 is the salt rounds

  //     // Update the admin's password
  //     const updateAdmin = await AdminSchema.findByIdAndUpdate(
  //       id,
  //       { password: hashedNewPassword }, // Only update the password
  //       { new: true } // Return the updated document
  //     );

  //     return this.sendJSONResponse(
  //       res,
  //       "Password updated successfully",
  //       {
  //         length: 1
  //       },
  //       updateAdmin
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error);
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  //delete admin
  async deleteAdmin(req, res) {
    try {
      const id = req.params.id;
      const findAdmin = await AdminSchema.find({ _id: id, status: 1 });
      if (findAdmin.length === 0) {
        throw new NotFound(`${id} admin is not found`);
      }
      const deleteAdmin = await AdminSchema.findByIdAndUpdate({ _id: id }, { status: 0 });
      return this.sendJSONResponse(
        res,
        `${id} admin deleted`,
        {
          length: 1
        },
        deleteAdmin
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  // login all
  async loginAll(req, res) {
    try {
      console.log('Admin login attempt:', {
        phone: req.body.phone,
        timestamp: new Date().toISOString()
      });

      // Validate required fields
      if (!req.body.phone || !req.body.password) {
        return res.status(400).json({
          status: false,
          message: "Validation failed",
          error: "Phone and password are required",
          howToFix: "Please provide both phone and password"
        });
      }

      // Find user with admin role
      const userData = await userschema.findOne({
        phone: req.body.phone,
        role: "admin"
      });

      console.log('Found user data:', userData ? {
        id: userData._id,
        role: userData.role,
        phone: userData.phone
      } : 'No user found');

      if (!userData) {
        return res.status(401).json({
          status: false,
          message: "Authentication failed",
          error: "Invalid phone number or role",
          howToFix: "Please check your phone number or contact administrator"
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(req.body.password, userData.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          status: false,
          message: "Authentication failed",
          error: "Invalid password",
          howToFix: "Please check your password and try again"
        });
      }

      // Prepare token data
      const tokenData = {
        id: userData._id,
        role: userData.role
      };

      // Create JWT token
      const token = jwt.sign(tokenData, process.env.JWT_SECRET || 'asd', {
        expiresIn: "365d"
      });

      // Handle device token if provided
      if (req.body.deviceToken && req.body.deviceType) {
        const validDeviceTypes = ['ios', 'android', 'web', 'expo'];
        if (validDeviceTypes.includes(req.body.deviceType)) {
          await userschema.findByIdAndUpdate(userData._id, {
            $set: {
              notificationTokens: {
                deviceType: req.body.deviceType,
                deviceToken: req.body.deviceToken,
                lastUpdatedOn: new Date()
              }
            }
          });
        }
      }

      // Get admin details
      const adminDetails = await AdminSchema.findOne({ user_id: userData._id });

      console.log('Login successful:', {
        userId: userData._id,
        role: userData.role,
        timestamp: new Date().toISOString()
      });

      // Set token in header
      res.setHeader('Authorization', `Bearer ${token}`);

      // Send response
      return res.status(200).json({
        status: true,
        message: "Login successful",
        token: token,
        user: {
          id: userData._id,
          role: userData.role,
          phone: userData.phone,
          name: adminDetails?.user_name || 'Admin',
          email: adminDetails?.email_address
        },
        instructions: {
          message: "Token has been set in the Authorization header",
          howTo: "Use this token in your subsequent requests by setting the Authorization header",
          example: {
            headers: {
              "Authorization": "Bearer " + token
            }
          }
        }
      });

    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({
        status: false,
        message: "Login failed",
        error: "Internal server error",
        details: error.message,
        howToFix: "Please try again later or contact support"
      });
    }
  }

  // Update Notification Tokens
  async updateNotificationTokens(req, res) {
    try {
      const tokenInfo = req.userData;
      if (!tokenInfo) {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const deviceToken = req.body.deviceToken;
      const deviceType = req.body.deviceType;
      const role = req.body.role;

      if (!deviceType || !deviceToken) {
        throw new Error("Invalid deviceType or deviceToken");
      }
      if (deviceType !== "ios" && deviceType !== "android" && deviceType !== "web") {
        throw new Error("Invalid deviceType");
      }

      //   Check if user exists
      let userInfo;
      if (role === 1) {
        userInfo = await AdminSchema.findOne({ _id: tokenInfo.id });
      } else if (role === 2) {
        userInfo = await agencySchema.findOne({ _id: tokenInfo.id });
      } else if (role === 3) {
        userInfo = await UserSchema.findOne({ _id: tokenInfo.id });
      }

      if (!userInfo) {
        throw new Error("User Not Found");
      }

      // set notificationTokens as null for other matching tokens
      let updatedUserProfile;
      if (role === 1) {
        const removedUserNotificationTokens = await AdminSchema.updateMany(
          {
            "notificationTokens.deviceToken": deviceToken
            //   "notificationTokens.deviceType": deviceType,
          },
          { $unset: { notificationTokens: "" } },
          { new: true }
        );
        // console.log(removedUserNotificationTokens);

        // update notification token in userProfile
        updatedUserProfile = await AdminSchema.findByIdAndUpdate(
          { _id: tokenInfo.id },
          {
            // $set: {
            //   [`notificationTokens.${deviceType}`]: [
            //     {
            //       deviceType: deviceType,
            //       deviceToken: deviceToken,
            //       lastUpdatedOn: new Date(),
            //     },
            //   ],
            // },
            $set: {
              [`notificationTokens`]: {
                deviceType: deviceType,
                deviceToken: deviceToken,
                lastUpdatedOn: new Date()
              }
            }
          },
          {
            new: true
          }
        );
        //   console.log(updatedUserProfile);
      } else if (role === 2) {
        const removedUserNotificationTokens = await agencySchema.updateMany(
          {
            "notificationTokens.deviceToken": deviceToken
            //   "notificationTokens.deviceType": deviceType,
          },
          { $unset: { notificationTokens: "" } },
          { new: true }
        );
        // console.log(removedUserNotificationTokens);

        // update notification token in userProfile
        updatedUserProfile = await agencySchema.findByIdAndUpdate(
          { _id: tokenInfo.id },
          {
            // $set: {
            //   [`notificationTokens.${deviceType}`]: [
            //     {
            //       deviceType: deviceType,
            //       deviceToken: deviceToken,
            //       lastUpdatedOn: new Date(),
            //     },
            //   ],
            // },
            $set: {
              [`notificationTokens`]: {
                deviceType: deviceType,
                deviceToken: deviceToken,
                lastUpdatedOn: new Date()
              }
            }
          },
          {
            new: true
          }
        );
        //   console.log(updatedUserProfile);
      } else if (role === 3) {
        const removedUserNotificationTokens = await UserSchema.updateMany(
          {
            "notificationTokens.deviceToken": deviceToken
            //   "notificationTokens.deviceType": deviceType,
          },
          { $unset: { notificationTokens: "" } },
          { new: true }
        );
        // console.log(removedUserNotificationTokens);

        // update notification token in userProfile
        updatedUserProfile = await UserSchema.findByIdAndUpdate(
          { _id: tokenInfo.id },
          {
            // $set: {
            //   [`notificationTokens.${deviceType}`]: [
            //     {
            //       deviceType: deviceType,
            //       deviceToken: deviceToken,
            //       lastUpdatedOn: new Date(),
            //     },
            //   ],
            // },
            $set: {
              [`notificationTokens`]: {
                deviceType: deviceType,
                deviceToken: deviceToken,
                lastUpdatedOn: new Date()
              }
            }
          },
          {
            new: true
          }
        );
        //   console.log(updatedUserProfile);
      }

      if (!updatedUserProfile) {
        throw new Error("Failed to Update Notification Tokens");
      }
      return this.sendJSONResponse(res, "Success");
    } catch (error) {
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_dashboard_details(req, res) {
    try {
      var This_Month_Male_User = 0,
        This_Year_Male_User = 0,
        Total_Male_User = 0,
        This_Month_Female_User = 0,
        This_Year_Female_User = 0,
        Total_Female_User = 0,
        This_Month_Paid_Male_User = 0,
        This_Year_Paid_Male_User = 0,
        Total_Paid_Male_User = 0,
        This_Month_Paid_Female_User = 0,
        This_Year_Paid_Female_User = 0,
        Total_Paid_Female_User = 0,
        Total_Paid_User = 0,
        This_Year_booking = 0,
        This_Month_booking = 0,
        Total_booking = 0,
        Total_Custom_Pkg = 0,
        This_Month_Custom_Pkg = 0,
        This_Year_Custom_Pkg = 0,
        Total_Agency = 0,
        This_Month_Agency = 0,
        This_Year_Agency = 0;

      //  res.send(bookings);
      const users = await userschema.aggregate([
        {
          $match: {}
        },
        {
          $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "user_id",
            as: "User_Details"
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        }
      ]);

      var bookings = await bookpackageschema.aggregate([
        {
          $match: {}
        },
        {
          $sort: { bookdate: -1 }
        }
      ]);

      const custom = await customRequirementSchema.aggregate([
        {
          $match: {}
        },
        {
          $sort: { createdAt: -1 }
        }
      ]);

      const Agency = await agencySchema.aggregate([
        {
          $match: {}
        }
      ]),
        Total_User = users.length;

      var currentDate = new Date();

      var currentDay = currentDate.getDate(); // Get the day (1-31)
      var currentMonth = currentDate.getMonth() + 1; // Get the month (0-11), add 1 to adjust for zero-based indexing
      var currentYear = currentDate.getFullYear(); // Get the four-digit year

      for (var i = 0; i < users.length; i++) {
        if (users[i]?.createdAt) {
          var cd, cm, cy, date;
          date = users[i].createdAt.toISOString().split("T")[0];
          cd = parseInt(date.split("-")[2]);
          cm = parseInt(date.split("-")[1]);
          cy = parseInt(date.split("-")[0]);
          if (users[i].gender == "Male") {
            Total_Male_User++;
          }
          if (users[i].gender == "Female") {
            Total_Female_User++;
          }
          if (cm == currentMonth && cy == currentYear) {
            if (users[i].gender == "Male") {
              This_Month_Male_User++;
            }
            if (users[i].gender == "Female") {
              This_Month_Female_User++;
            }
          }
          if (cy == currentYear) {
            if (users[i].gender == "Male") {
              This_Year_Male_User++;
            }
            if (users[i].gender == "Female") {
              This_Year_Female_User++;
            }
          }
        }
      }
      Total_booking = bookings.length;
      for (var i = 0; i < bookings.length; i++) {
        var cd, cm, cy, date;
        date = bookings[i].bookdate.toISOString().split("T")[0];
        cd = parseInt(date.split("-")[2]);
        cm = parseInt(date.split("-")[1]);
        cy = parseInt(date.split("-")[0]);

        if (cm == currentMonth && cy == currentYear) {
          This_Month_booking++;
        }
        if (cy == currentYear) {
          This_Year_booking++;
        }
      }

      Total_Custom_Pkg = custom.length;
      for (var i = 0; i < custom.length; i++) {
        if (custom[i].createdAt) {
          var cd, cm, cy, date;
          date = custom[i].createdAt.toISOString().split("T")[0];
          cd = parseInt(date.split("-")[2]);
          cm = parseInt(date.split("-")[1]);
          cy = parseInt(date.split("-")[0]);

          if (cm == currentMonth && cy == currentYear) {
            This_Month_Custom_Pkg++;
          }
          if (cy == currentYear) {
            This_Year_Custom_Pkg++;
          }
        }
      }
      Total_Agency = Agency.length;
      for (var i = 0; i < Agency.length; i++) {
        var cd, cm, cy, date;
        if (Agency[i].createdAt) {
          date = Agency[i].createdAt.toISOString().split("T")[0];
          cd = parseInt(date.split("-")[2]);
          cm = parseInt(date.split("-")[1]);
          cy = parseInt(date.split("-")[0]);

          if (cm == currentMonth && cy == currentYear) {
            This_Month_Agency++;
          }
          if (cy == currentYear) {
            This_Year_Agency++;
          }
        }
      }

      var data = {
        Total_User: Total_User,
        Total_Male_User: Total_Male_User,
        This_Month_Male_User: This_Month_Male_User,
        This_Year_Male_User: This_Year_Male_User,

        Total_Female_User: Total_Female_User,
        This_Month_Female_User: This_Month_Female_User,
        This_Year_Female_User: This_Year_Female_User,

        Total_booking: Total_booking,
        This_Month_booking: This_Month_booking,
        This_Year_booking: This_Year_booking,

        Total_Custom_Pkg: Total_Custom_Pkg,
        This_Month_Custom_Pkg: This_Month_Custom_Pkg,
        This_Year_Custom_Pkg: This_Year_Custom_Pkg,

        Total_Agency: Total_Agency,
        This_Month_Agency: This_Month_Agency,
        This_Year_Agency: This_Year_Agency
      };

      if (bookings.length > 20) {
        bookings = bookings.slice(0, 30);
      }

      var booking2 = await bookpackageschema.aggregate([
        {
          $match: {}
        },
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bids",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  localField: "agency_id",
                  foreignField: "_id",
                  as: "AgencyPersonals",
                  pipeline: [
                    {
                      $lookup: {
                        from: "agencypersonals",
                        localField: "_id",
                        foreignField: "user_id",
                        as: "AgencyPersonalsDetails"
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]);

      var booking3 = await bookpackageschema.aggregate([
        {
          $match: {}
        },
        {
          $lookup: {
            from: "custom_requirements",
            localField: "custom_package_id",
            foreignField: "_id",
            as: "custom"
          }
        }
      ]);
      // res.send(booking2);
      const booking4 = await bookpackageschema.aggregate([
        {
          $match: {}
        },
        {
          $lookup: {
            from: "custom_requirements",
            localField: "custom_package_id",
            foreignField: "_id",
            as: "custom"
          }
        },
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bids",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  localField: "agency_id",
                  foreignField: "_id",
                  as: "AgencyPersonals",
                  pipeline: [
                    {
                      $lookup: {
                        from: "agencypersonals",
                        localField: "_id",
                        foreignField: "user_id",
                        as: "AgencyPersonalsDetails"
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
            from: "book_package_itineraries",
            localField: "_id",
            foreignField: "book_package_id",
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
      const custom2 = await customRequirementSchema.aggregate([
        {
          $match: {}
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categories"
          }
        },
        {
          $lookup: {
            from: "customers",
            localField: "user_id",
            foreignField: "user_id",
            as: "User_details"
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]);
      if (booking4.length > 30) {
        booking4.slice(0, 30);
      }
      if (custom2.length > 30) {
        custom2.slice(0, 30);
      }
      var top_agency_1_month = await req_data(booking2, 1);
      var top_agency_3_month = await req_data(booking2, 3);
      var top_agency_6_month = await req_data(booking2, 6);
      var top_agency_12_month = await req_data(booking2, 12);
      var top_5_booking_dest = await req_data2.topDest2(booking3);
      var top_5_custom_req_dest = await req_data2.topDest(custom);
      var fans = [];

      fans.push({ Top_stats: data });
      fans.push({ top_agency_1_month: top_agency_1_month });
      fans.push({ top_agency_3_month: top_agency_3_month });
      fans.push({ top_agency_6_month: top_agency_6_month });
      fans.push({ top_agency_12_month: top_agency_12_month });
      fans.push({ top_5_booking_dest: top_5_booking_dest });
      fans.push({ top_5_custom_req_dest: top_5_custom_req_dest });
      fans.push({ Top_30_book_packages: booking4 });
      fans.push({ Top_30_custom_req: custom2 });
      return this.sendJSONResponse(
        res,
        "display_dashboard_details_top",
        {
          length: 1
        },
        fans
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_dashboard_details(req, res) {
    try {
      var This_Month_Male_User = 0,
        This_Year_Male_User = 0,
        Total_Male_User = 0,
        This_Month_Female_User = 0,
        This_Year_Female_User = 0,
        Total_Female_User = 0,
        This_Month_Paid_Male_User = 0,
        This_Year_Paid_Male_User = 0,
        Total_Paid_Male_User = 0,
        This_Month_Paid_Female_User = 0,
        This_Year_Paid_Female_User = 0,
        Total_Paid_Female_User = 0,
        Total_Paid_User = 0,
        This_Year_booking = 0,
        This_Month_booking = 0,
        Total_booking = 0,
        Total_Custom_Pkg = 0,
        This_Month_Custom_Pkg = 0,
        This_Year_Custom_Pkg = 0,
        Total_Agency = 0,
        This_Month_Agency = 0,
        This_Year_Agency = 0;

      //  res.send(bookings);
      const users = await userschema.aggregate([
        {
          $match: {}
        },
        {
          $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "user_id",
            as: "User_Details"
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        }
      ]);

      var bookings = await bookpackageschema.aggregate([
        {
          $match: {}
        },
        {
          $sort: { bookdate: -1 }
        }
      ]);

      const custom = await customRequirementSchema.aggregate([
        {
          $match: {}
        },
        {
          $sort: { createdAt: -1 }
        }
      ]);

      const Agency = await agencySchema.aggregate([
        {
          $match: {}
        }
      ]),
        Total_User = users.length;

      var currentDate = new Date();

      var currentDay = currentDate.getDate(); // Get the day (1-31)
      var currentMonth = currentDate.getMonth() + 1; // Get the month (0-11), add 1 to adjust for zero-based indexing
      var currentYear = currentDate.getFullYear(); // Get the four-digit year

      for (var i = 0; i < users.length; i++) {
        if (users[i]?.createdAt) {
          var cd, cm, cy, date;
          date = users[i].createdAt.toISOString().split("T")[0];
          cd = parseInt(date.split("-")[2]);
          cm = parseInt(date.split("-")[1]);
          cy = parseInt(date.split("-")[0]);
          if (users[i].gender == "Male") {
            Total_Male_User++;
          }
          if (users[i].gender == "Female") {
            Total_Female_User++;
          }
          if (cm == currentMonth && cy == currentYear) {
            if (users[i].gender == "Male") {
              This_Month_Male_User++;
            }
            if (users[i].gender == "Female") {
              This_Month_Female_User++;
            }
          }
          if (cy == currentYear) {
            if (users[i].gender == "Male") {
              This_Year_Male_User++;
            }
            if (users[i].gender == "Female") {
              This_Year_Female_User++;
            }
          }
        }
      }
      Total_booking = bookings.length;
      for (var i = 0; i < bookings.length; i++) {
        var cd, cm, cy, date;
        date = bookings[i].bookdate.toISOString().split("T")[0];
        cd = parseInt(date.split("-")[2]);
        cm = parseInt(date.split("-")[1]);
        cy = parseInt(date.split("-")[0]);

        if (cm == currentMonth && cy == currentYear) {
          This_Month_booking++;
        }
        if (cy == currentYear) {
          This_Year_booking++;
        }
      }

      Total_Custom_Pkg = custom.length;
      for (var i = 0; i < custom.length; i++) {
        if (custom[i].createdAt) {
          var cd, cm, cy, date;
          date = custom[i].createdAt.toISOString().split("T")[0];
          cd = parseInt(date.split("-")[2]);
          cm = parseInt(date.split("-")[1]);
          cy = parseInt(date.split("-")[0]);

          if (cm == currentMonth && cy == currentYear) {
            This_Month_Custom_Pkg++;
          }
          if (cy == currentYear) {
            This_Year_Custom_Pkg++;
          }
        }
      }
      Total_Agency = Agency.length;
      for (var i = 0; i < Agency.length; i++) {
        var cd, cm, cy, date;
        if (Agency[i].createdAt) {
          date = Agency[i].createdAt.toISOString().split("T")[0];
          cd = parseInt(date.split("-")[2]);
          cm = parseInt(date.split("-")[1]);
          cy = parseInt(date.split("-")[0]);

          if (cm == currentMonth && cy == currentYear) {
            This_Month_Agency++;
          }
          if (cy == currentYear) {
            This_Year_Agency++;
          }
        }
      }

      var data = {
        Total_User: Total_User,
        Total_Male_User: Total_Male_User,
        This_Month_Male_User: This_Month_Male_User,
        This_Year_Male_User: This_Year_Male_User,

        Total_Female_User: Total_Female_User,
        This_Month_Female_User: This_Month_Female_User,
        This_Year_Female_User: This_Year_Female_User,

        Total_booking: Total_booking,
        This_Month_booking: This_Month_booking,
        This_Year_booking: This_Year_booking,

        Total_Custom_Pkg: Total_Custom_Pkg,
        This_Month_Custom_Pkg: This_Month_Custom_Pkg,
        This_Year_Custom_Pkg: This_Year_Custom_Pkg,

        Total_Agency: Total_Agency,
        This_Month_Agency: This_Month_Agency,
        This_Year_Agency: This_Year_Agency
      };

      if (bookings.length > 20) {
        bookings = bookings.slice(0, 30);
      }

      var booking2 = await bookpackageschema.aggregate([
        {
          $match: {
            status: "booked"
          }
        },
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bids",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  localField: "agency_id",
                  foreignField: "_id",
                  as: "AgencyPersonals",
                  pipeline: [
                    {
                      $lookup: {
                        from: "agencypersonals",
                        localField: "_id",
                        foreignField: "user_id",
                        as: "AgencyPersonalsDetails"
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]);

      var booking3 = await bookpackageschema.aggregate([
        {
          $match: {
            status: "booked"
          }
        },
        {
          $lookup: {
            from: "custom_requirements",
            localField: "custom_requirement_id",
            foreignField: "_id",
            as: "custom"
          }
        }
      ]);

      console.log("booking3", booking3);

      var booking4 = await bookpackageschema.aggregate([
        {
          $match: {
            status: "booked"
          }
        },
        {
          $lookup: {
            from: "custom_requirements",
            localField: "custom_package_id",
            foreignField: "_id",
            as: "custom"
          }
        },
        {
          $lookup: {
            from: "bids",
            localField: "bid_package_id",
            foreignField: "_id",
            as: "bids",
            pipeline: [
              {
                $lookup: {
                  from: "users",
                  localField: "agency_id",
                  foreignField: "_id",
                  as: "AgencyPersonals",
                  pipeline: [
                    {
                      $lookup: {
                        from: "agencypersonals",
                        localField: "_id",
                        foreignField: "user_id",
                        as: "AgencyPersonalsDetails"
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
            from: "book_package_itineraries",
            localField: "_id",
            foreignField: "book_package_id",
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

      var custom2 = await customRequirementSchema.aggregate([
        {
          $match: {}
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
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categories"
          }
        },
        {
          $lookup: {
            from: "customers",
            localField: "user_id",
            foreignField: "user_id",
            as: "User_details"
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]);

      if (booking4.length > 30) {
        booking4 = booking4.slice(0, 30);
      }
      if (custom2.length > 30) {
        custom2 = custom2.slice(0, 30);
      }
      console.log(booking4.length);
      console.log(custom2.length);
      var top_agency_1_month = await req_data(booking2, 1);
      var top_agency_3_month = await req_data(booking2, 3);
      var top_agency_6_month = await req_data(booking2, 6);
      var top_agency_12_month = await req_data(booking2, 12);
      var top_5_booking_dest = await req_data2.topDest2(booking3);
      var top_5_custom_req_dest = await req_data2.topDest(custom);
      var fans = [];

      fans.push({ Top_stats: data });
      fans.push({ top_agency_1_month: top_agency_1_month });
      fans.push({ top_agency_3_month: top_agency_3_month });
      fans.push({ top_agency_6_month: top_agency_6_month });
      fans.push({ top_agency_12_month: top_agency_12_month });
      fans.push({ top_5_booking_dest: top_5_booking_dest });
      fans.push({ top_5_custom_req_dest: top_5_custom_req_dest });
      fans.push({ Top_30_book_packages: booking4 });
      fans.push({ Top_30_custom_req: custom2 });

      return this.sendJSONResponse(
        res,
        "display_dashboard_details_top",
        {
          length: 1
        },
        fans
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async forget_password(req, res) {
    try {
      const data = {
        phone: req.body.phone,
        role: "admin"
      };
      const findnumber = await userschema.findOne(data);
      // const userData = await userSchema.findById({_id: tokenData.id});
      console.log(findnumber);
      // if(findnumber.mobile_number !== 0){
      //     console.log("123");

      const hashedPassword = await bcrypt.hash(req.body.new_password, 10);

      const updatedData = await userschema.findOneAndUpdate(
        { phone: req.body.phone, role: "admin" },
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

        return res.status(200).json({ contact: contact, message: "OTP sent and saved successfully" });
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

  async admin_dashboard(req, res) {
    try {
      // User Count

      const totalMaleUsers = await UserSchema.countDocuments({ gender: "male" });
      const totalFemaleUsers = await UserSchema.countDocuments({ gender: "female" });

      const currentYear = new Date().getFullYear();

      const totalMaleThisYear = await UserSchema.countDocuments({
        gender: "male",
        createdAt: {
          $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
        }
      });

      const totalFemaleThisYear = await UserSchema.countDocuments({
        gender: "female",
        createdAt: {
          $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
        }
      });

      const currentMonth = new Date().getMonth() + 1; // Get the current month (0-based index, so add 1)

      const totalMaleThisMonth = await UserSchema.countDocuments({
        gender: "male",
        createdAt: {
          $gte: new Date(currentYear, currentMonth - 1, 1), // Start of the month
          $lte: new Date(currentYear, currentMonth, 0) // End of the month
        }
      });

      const totalFemaleThisMonth = await UserSchema.countDocuments({
        gender: "female",
        createdAt: {
          $gte: new Date(currentYear, currentMonth - 1, 1), // Start of the month
          $lte: new Date(currentYear, currentMonth, 0) // End of the month
        }
      });

      //agency Count

      const totalAgencies = await agencySchema.countDocuments({ status: "active" });

      const totalAgenciesThisYear = await agencySchema.countDocuments({
        status: "active",
        createdAt: {
          $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
        }
      });

      const totalAgenciesThisMonth = await agencySchema.countDocuments({
        status: "active",
        createdAt: {
          $gte: new Date(currentYear, currentMonth - 1, 1), // Start of the month
          $lte: new Date(currentYear, currentMonth, 0) // End of the month
        }
      });

      //Booking Count

      const totalBookings = await bookpackageschema.countDocuments({ status: "booked" });

      const totalBookingsThisYear = await bookpackageschema.countDocuments({
        status: "booked",
        createdAt: {
          $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
        }
      });

      const totalBookingsThisMonth = await bookpackageschema.countDocuments({
        status: "booked",
        createdAt: {
          $gte: new Date(currentYear, currentMonth - 1, 1), // Start of the month
          $lte: new Date(currentYear, currentMonth, 0) // End of the month
        }
      });

      //package count

      const totalPackages = await packageSchema.countDocuments({ status: true });

      const totalPackagesThisYear = await packageSchema.countDocuments({
        status: true,
        createdAt: {
          $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
        }
      });

      const totalPackagesThisMonth = await packageSchema.countDocuments({
        status: true,
        createdAt: {
          $gte: new Date(currentYear, currentMonth - 1, 1), // Start of the month
          $lte: new Date(currentYear, currentMonth, 0) // End of the month
        }
      });

      //Top 5 Booking Destinations

      const top5Destinations = await bookpackageschema.aggregate([
        {
          $match: { status: "booked" }
        },
        {
          $group: {
            _id: "$destination",
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5
        }
      ]);

      //Top 5 Custom Destinations

      const top5CustomDestinations = await customRequirementSchema.aggregate([
        {
          $group: {
            _id: "$destination",
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5
        }
      ]);

      //Top 5 Travel Agencies Monthly
      const top5BidBookingAgenciesThisMonth = await bookpackageschema.aggregate([
        {
          $match: {
            status: "booked",
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of the current month
              $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) // End of the current month
            }
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
          $unwind: "$bids"
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
          $unwind: "$agency"
        },
        {
          $group: {
            _id: "$agency.user_id", // Group by agency ID
            agencyName: { $first: "$agency.agency_name" }, // Get the agency name
            bidBookingCount: { $sum: 1 } // Count the number of bid bookings
          }
        }
      ]);

      const top5PackageBookingAgenciesThisMonth = await bookpackageschema.aggregate([
        {
          $match: {
            status: "booked",
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of the current month
              $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) // End of the current month
            }
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
          $unwind: "$package"
        },
        {
          $lookup: {
            from: "agencypersonals",
            localField: "package.user_id",
            foreignField: "user_id",
            as: "agency"
          }
        },
        {
          $unwind: "$agency"
        },
        {
          $group: {
            _id: "$agency.user_id", // Group by agency ID
            agencyName: { $first: "$agency.agency_name" }, // Get the agency name
            packageBookingCount: { $sum: 1 } // Count the number of package bookings
          }
        }
      ]);

      // Combine the results from both aggregations
      const combinedAgencyBookings = [
        ...top5BidBookingAgenciesThisMonth,
        ...top5PackageBookingAgenciesThisMonth
      ].reduce((acc, agency) => {
        const existingAgency = acc.find((a) => a._id.toString() === agency._id.toString());
        if (existingAgency) {
          existingAgency.bidBookingCount = (existingAgency.bidBookingCount || 0) + (agency.bidBookingCount || 0);
          existingAgency.packageBookingCount =
            (existingAgency.packageBookingCount || 0) + (agency.packageBookingCount || 0);
          existingAgency.totalBookingCount =
            (existingAgency.totalBookingCount || 0) + (agency.bidBookingCount || 0) + (agency.packageBookingCount || 0);
        } else {
          acc.push({
            _id: agency._id,
            agencyName: agency.agencyName,
            bidBookingCount: agency.bidBookingCount || 0,
            packageBookingCount: agency.packageBookingCount || 0,
            totalBookingCount: (agency.bidBookingCount || 0) + (agency.packageBookingCount || 0)
          });
        }
        return acc;
      }, []);

      // Sort by total booking count in descending order and limit to top 5
      const top5CombinedAgencies = combinedAgencyBookings
        .sort((a, b) => b.totalBookingCount - a.totalBookingCount)
        .slice(0, 5);

      //Top 5 Travel Agencies Past 3 Months

      const top5BidAgenciesPast3Months = await bookpackageschema.aggregate([
        {
          $match: {
            status: "booked",
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 3)), // Start of the past 3 months
              $lte: new Date() // Current date
            }
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
          $unwind: "$bids"
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
          $unwind: "$agency"
        },
        {
          $group: {
            _id: "$agency.user_id", // Group by agency ID
            agencyName: { $first: "$agency.agency_name" }, // Get the agency name
            bidBookingCount: { $sum: 1 } // Count the number of bid bookings
          }
        }
      ]);

      const top5PackageAgenciesPast3Months = await bookpackageschema.aggregate([
        {
          $match: {
            status: "booked",
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 3)), // Start of the past 3 months
              $lte: new Date() // Current date
            }
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
          $unwind: "$package"
        },
        {
          $lookup: {
            from: "agencypersonals",
            localField: "package.user_id",
            foreignField: "user_id",
            as: "agency"
          }
        },
        {
          $unwind: "$agency"
        },
        {
          $group: {
            _id: "$agency.user_id", // Group by agency ID
            agencyName: { $first: "$agency.agency_name" }, // Get the agency name
            packageBookingCount: { $sum: 1 } // Count the number of package bookings
          }
        }
      ]);

      const combinedPast3MonthsAgencyBookings = [
        ...top5BidAgenciesPast3Months,
        ...top5PackageAgenciesPast3Months
      ].reduce((acc, agency) => {
        const existingAgency = acc.find((a) => a._id.toString() === agency._id.toString());
        if (existingAgency) {
          existingAgency.bidBookingCount = (existingAgency.bidBookingCount || 0) + (agency.bidBookingCount || 0);
          existingAgency.packageBookingCount =
            (existingAgency.packageBookingCount || 0) + (agency.packageBookingCount || 0);
          existingAgency.totalBookingCount =
            (existingAgency.totalBookingCount || 0) + (agency.bidBookingCount || 0) + (agency.packageBookingCount || 0);
        } else {
          acc.push({
            _id: agency._id,
            agencyName: agency.agencyName,
            bidBookingCount: agency.bidBookingCount || 0,
            packageBookingCount: agency.packageBookingCount || 0,
            totalBookingCount: (agency.bidBookingCount || 0) + (agency.packageBookingCount || 0)
          });
        }
        return acc;
      }, []);

      // Sort by total booking count in descending order and limit to top 5
      const top5PastCombineCombinedAgencies = combinedPast3MonthsAgencyBookings
        .sort((a, b) => b.totalBookingCount - a.totalBookingCount)
        .slice(0, 5);

      //Top 6 Months Agency Bookings

      const top6MonthsBidAgencyBookings = await bookpackageschema.aggregate([
        {
          $match: {
            status: "booked",
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)), // Start of the past 6 months
              $lte: new Date() // Current date
            }
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
          $unwind: "$bids"
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
          $unwind: "$agency"
        },
        {
          $group: {
            _id: "$agency.user_id", // Group by agency ID
            agencyName: { $first: "$agency.agency_name" }, // Get the agency name
            bookingCount: { $sum: 1 } // Count the number of bookings
          }
        },
        {
          $sort: { bookingCount: -1 } // Sort by booking count in descending order
        }
      ]);

      const top6MonthsPackageAgencyBookings = await bookpackageschema.aggregate([
        {
          $match: {
            status: "booked",
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)), // Start of the past 6 months
              $lte: new Date() // Current date
            }
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
          $unwind: "$package"
        },
        {
          $lookup: {
            from: "agencypersonals",
            localField: "package.user_id",
            foreignField: "user_id",
            as: "agency"
          }
        },
        {
          $unwind: "$agency"
        },
        {
          $group: {
            _id: "$agency.user_id", // Group by agency ID
            agencyName: { $first: "$agency.agency_name" }, // Get the agency name
            bookingCount: { $sum: 1 } // Count the number of bookings
          }
        },
        {
          $sort: { bookingCount: -1 } // Sort by booking count in descending order
        }
      ]);

      const combined6MonthsAgencyBookings = [...top6MonthsBidAgencyBookings, ...top6MonthsPackageAgencyBookings].reduce(
        (acc, agency) => {
          const existingAgency = acc.find((a) => a._id.toString() === agency._id.toString());
          if (existingAgency) {
            existingAgency.bookingCount = (existingAgency.bookingCount || 0) + agency.bookingCount;
          } else {
            acc.push({
              _id: agency._id,
              agencyName: agency.agencyName,
              bookingCount: agency.bookingCount
            });
          }
          return acc;
        },
        []
      );
      // Sort by booking count in descending order and limit to top 5
      const top6MonthsCombinedAgencies = combined6MonthsAgencyBookings
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 5);

      // Top 12 Momths Agency Bookings Counts

      const top12MonthsBidAgencyBookings = await bookpackageschema.aggregate([
        {
          $match: {
            status: "booked",
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)), // Start of the past 12 months
              $lte: new Date() // Current date
            }
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
          $unwind: "$bids"
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
          $unwind: "$agency"
        },
        {
          $group: {
            _id: "$agency.user_id", // Group by agency ID
            agencyName: { $first: "$agency.agency_name" }, // Get the agency name
            bookingCount: { $sum: 1 } // Count the number of bookings
          }
        },
        {
          $sort: { bookingCount: -1 } // Sort by booking count in descending order
        }
      ]);

      const top12MonthsPackageAgencyBookings = await bookpackageschema.aggregate([
        {
          $match: {
            status: "booked",
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)), // Start of the past 12 months
              $lte: new Date() // Current date
            }
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
          $unwind: "$package"
        },
        {
          $lookup: {
            from: "agencypersonals",
            localField: "package.user_id",
            foreignField: "user_id",
            as: "agency"
          }
        },
        {
          $unwind: "$agency"
        },
        {
          $group: {
            _id: "$agency.user_id", // Group by agency ID
            agencyName: { $first: "$agency.agency_name" }, // Get the agency name
            bookingCount: { $sum: 1 } // Count the number of bookings
          }
        },
        {
          $sort: { bookingCount: -1 } // Sort by booking count in descending order
        }
      ]);

      const combined12MonthsAgencyBookings = [
        ...top12MonthsBidAgencyBookings,
        ...top12MonthsPackageAgencyBookings
      ].reduce((acc, agency) => {
        const existingAgency = acc.find((a) => a._id.toString() === agency._id.toString());
        if (existingAgency) {
          existingAgency.bookingCount = (existingAgency.bookingCount || 0) + agency.bookingCount;
        } else {
          acc.push({
            _id: agency._id,
            agencyName: agency.agencyName,
            bookingCount: agency.bookingCount
          });
        }
        return acc;
      }, []);

      // Sort by booking count in descending order and limit to top 5
      const top12MonthsCombinedAgencies = combined12MonthsAgencyBookings
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 5);

      // Top 30 Custom Requirements

      let customRequirements = await customRequirementSchema.aggregate([
        {
          $lookup: {
            from: "customers",
            localField: "user_id",
            foreignField: "user_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
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
            customer_name: "$user.name",
            createdAt: 1,
            budget_per_person: 1,
            start_date: 1,
            end_date: 1,
            status: 1,
            total_bid: { $size: "$bids" } // Add field for bid count
          }
        },
        {
          $sort: { total_bid: -1 }
        }
      ]);

      if (customRequirements.length > 30) {
        customRequirements = customRequirements.slice(0, 30);
      }

      // Top 30 Book Packages

      let bookPackages = await bookpackageschema.aggregate([
        {
          $match: {}
        },
        {
          $lookup: {
            from: "customers",
            localField: "user_registration_id",
            foreignField: "user_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            _id: 1,
            departure: 1,
            destination: 1,
            customer_name: "$user.name",
            bookdate: 1,
            destination_arrival_date: 1,
            approx_end_date: 1,
            approx_start_date: 1,
            total_amount: 1,
            status: 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ]);

      if (bookPackages.length > 30) {
        bookPackages = bookPackages.slice(0, 30);
      }

      const result = {
        totalMaleUsers,
        totalFemaleUsers,
        totalMaleThisYear,
        totalFemaleThisYear,
        totalMaleThisMonth,
        totalFemaleThisMonth,
        totalAgencies,
        totalAgenciesThisYear,
        totalAgenciesThisMonth,
        totalBookings,
        totalBookingsThisYear,
        totalBookingsThisMonth,
        totalPackages,
        totalPackagesThisYear,
        totalPackagesThisMonth,
        top5Destinations,
        top5CustomDestinations,
        top5BookingAgenciesThisMonth: top5CombinedAgencies,
        top5BookingAgenciesPast3Month: top5PastCombineCombinedAgencies,
        top5BookingAgenciesPast6Month: top6MonthsCombinedAgencies,
        top5BookingAgenciesPast12Month: top12MonthsCombinedAgencies,
        top30CustomRequirements: customRequirements,
        top30BookPackages: bookPackages
      };

      return this.sendJSONResponse(
        res,
        "admin dashboard details",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
