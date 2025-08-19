const { errorMonitor } = require("nodemailer/lib/xoauth2");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const BaseController = require("./BaseController");
const userschema = require("../models/usersSchema");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const agencySchema = require("../models/Agency_personalSchema");
const customerSchema = require("../models/customerSchema");
const Notificationschema = require("../models/NotificationSchema");
const { getReceiverSocketId, io } = require("../socket/socket");
const debug = require('debug')('start-your-tour:usercontroller');

module.exports = class usercontroller extends BaseController {
  // async loginAll(req, res) {
  //   try {
  //     const data = {
  //       phone: req.body.phone,
  //       password: req.body.password,
  //       role: req.body.role
  //     };
  //     console.log(data);

  //     let userData = await userschema.find(data);

  //     let userphone = await userschema.aggregate([{ $match: { phone: req.body.phone } }]);

  //     let userpassword = await userschema.aggregate([{ $match: { password: req.body.password } }]);

  //     console.log(userData);
  //     console.log(userphone);

  //     const isPasswordValid = await bcrypt.compare(data.password, userData.password);
  //     if (!isPasswordValid) {
  //       throw new Forbidden("Password is incorrect");
  //     }

  //     if (userphone.length === 0) {
  //       throw new Forbidden("mobile number is wrong");
  //     }
  //     if (userpassword.length === 0) {
  //       throw new Forbidden("password is wrong");
  //     }

  //     if (
  //       req.body.role != "admin" &&
  //       req.body.role != "agency" &&
  //       req.body.role != "customer" &&
  //       req.body.role != "member"
  //     ) {
  //       console.log(req.body.role, typeof req.body.role);
  //       throw new Error("Invalid role");
  //     }
  //     if (userData.length === 0) {
  //       throw new Forbidden("mobile number and password is wrong");
  //     }
  //     //   if (userData[0].status !== "active") {
  //     //     throw new Forbidden("you are blocked");
  //     //   }

  //     //   Update Notification Token if send from login
  //     //   if (req.body?.deviceToken && req.body?.deviceType) {
  //     //     try {
  //     //       const deviceToken = req.body.deviceToken;
  //     //       const deviceType = req.body.deviceType;

  //     //       if (!deviceType || !deviceToken) {
  //     //         throw new Error("Invalid deviceType or deviceToken");
  //     //       }
  //     //       if (deviceType !== "ios" && deviceType !== "android" && deviceType !== "web") {
  //     //         throw new Error("Invalid deviceType");
  //     //       }

  //     //   Check if user exists
  //     //   const userInfo = await userSchema.findById(userData[0]._id);
  //     //   if (!userInfo) {
  //     //     throw new Error("User Not Found");
  //     //   }

  //     // set notificationTokens as null for other matching tokens
  //     //   const removedUserNotificationTokens = await userSchema.updateMany(
  //     //     {
  //     //       "notificationTokens.deviceToken": deviceToken
  //     //       //   "notificationTokens.deviceType": deviceType,
  //     //     },
  //     //     { $unset: { notificationTokens: "" } },
  //     //     { new: true }
  //     //   );
  //     // console.log(removedUserNotificationTokens);

  //     // update notification token in userProfile
  //     //   const updatedUserProfile = await userSchema.findByIdAndUpdate(
  //     //     userData[0]._id,
  //     //     {
  //     //       // $set: {
  //     //   [`notificationTokens.${deviceType}`]: [
  //     //     {
  //     //       deviceType: deviceType,
  //     //       deviceToken: deviceToken,
  //     //       lastUpdatedOn: new Date(),
  //     //     },
  //     //   ],
  //     // },
  //     //       $set: {
  //     //         [`notificationTokens`]: {
  //     //           deviceType: deviceType,
  //     //           deviceToken: deviceToken,
  //     //           lastUpdatedOn: new Date()
  //     //         }
  //     //       }
  //     //     },
  //     //     {
  //     //       new: true
  //     //     }
  //     //   );
  //     //   console.log(updatedUserProfile);

  //     //       if (!updatedUserProfile) {
  //     //         throw new Error("Failed to Update Notification Tokens");
  //     //       }
  //     //     } catch (error) {
  //     //       console.log(error);
  //     //     }
  //     //   }

  //     const requireData = {
  //       id: userData[0]._id,
  //       role: userData[0].role,
  //       email_address: userData[0].email_address
  //     };

  //     const token = jwt.sign(requireData, "asd", { expiresIn: "365d" });
  //     const result = {
  //       token: token,
  //       userId: userData[0]._id
  //     };

  //     return this.sendJSONResponse(
  //       res,
  //       "successfully login",
  //       {
  //         length: 1
  //       },
  //       result
  //     );
  //   } catch (error) {
  //     if (error instanceof NotFound) {
  //       console.log(error); // throw error;;
  //     }
  //     return this.sendErrorResponse(req, res, error);
  //   }
  // }

  async loginAll(req, res) {
    debug('Debug: Entering loginAll method');
    try {
      const { phone, password, role } = req.body;
      debug(`Debug: Received login request - phone: ${phone}, role: ${role}`);

      console.log({ phone, password, role });

      // Debug database connection
      console.log('Database connection state:', mongoose.connection.readyState);

      // List all users in the database
      const allUsers = await userschema.find({});
      console.log('All users in database:', allUsers);

      // Try different phone number formats
      const phoneNumber = parseInt(phone, 10);
      console.log('Attempting queries with different phone formats...');

      // Try finding with the original string
      console.log('Trying with original string:', phone);
      const userWithStringPhone = await userschema.find({ phone: phone });
      console.log('Results with string phone:', userWithStringPhone);

      // Try finding with the number
      console.log('Trying with number:', phoneNumber);
      const userWithNumberPhone = await userschema.find({ phone: phoneNumber });
      console.log('Results with number phone:', userWithNumberPhone);

      // Try finding without any type conversion
      console.log('Trying raw query...');
      const rawUsers = await userschema.find({});
      console.log('All users in database:', rawUsers.map(u => ({
        _id: u._id,
        phone: u.phone,
        role: u.role,
        phoneType: typeof u.phone
      })));

      // Use the number version for the actual login check
      const userWithPhone = await userschema.findOne({ phone: phoneNumber });
      console.log('Final user found with phone:', userWithPhone);

      let userData = await userschema.findOne({ phone: phoneNumber, role });
      console.log('Final user found with phone and role:', userData);      // Check if the user is found
      if (!userData) {
        if (userWithPhone) {
          debug('Debug: User found with phone but wrong role');
          throw new Forbidden("Invalid role for this user");
        } else {
          debug('Debug: User not found with given phone');
          throw new Forbidden("Mobile number is incorrect");
        }
      }

      // Compare the provided password with the stored hashed password
      debug(`Debug: Comparing password for user ${userData._id}`);
      const isPasswordValid = await bcrypt.compare(password, userData.password);
      if (!isPasswordValid) {
        debug('Debug: Password comparison failed');
        throw new Forbidden("Password is incorrect");
      }

      // Validate role
      const validRoles = ["admin", "agency", "customer", "member"];
      debug(`Debug: Validating role: ${role}, valid roles: ${validRoles.join(', ')}`);
      if (!validRoles.includes(role)) {
        debug('Debug: Invalid role detected');
        throw new Error("Invalid role");
      }

      // Create JWT token
      debug(`Debug: Generating JWT token for user ${userData._id}`);
      const requireData = {
        id: userData._id,
        role: userData.role
      };
      console.log('Token data:', requireData);

      const token = jwt.sign(requireData, 'asd', {
        expiresIn: "365d"
      });
      console.log('Generated token:', token);

      const result = {
        token: token,
        userId: userData._id,
        role: userData.role
      };
      debug(`Debug: JWT token generated: ${token.substring(0, 10)}...`);

      let notificationMessage = "";

      if (role === "agency") {
        debug(`Debug: Fetching agency data for user ${userData._id}`);
        let agency = await agencySchema.findOne({ user_id: userData._id });
        notificationMessage =
          agency && agency.full_name
            ? `Welcome back, ${agency.full_name}! Your agency dashboard awaits.`
            : `Welcome back! Your agency dashboard awaits.`;
        debug(`Debug: Agency notification message: ${notificationMessage}`);
      } else if (role === "customer") {
        debug(`Debug: Fetching customer data for user ${userData._id}`);
        let user = await customerSchema.findOne({ user_id: userData._id });
        notificationMessage =
          user && user.name
            ? `Hello ${user.name}, great to see you again! Start exploring now.`
            : `Hello, great to see you again! Start exploring now.`;
        debug(`Debug: Customer notification message: ${notificationMessage}`);
      } else if (role === "admin") {
        notificationMessage = `Welcome to Start Your Tour!`;
        debug(`Debug: Admin notification message: ${notificationMessage}`);
      }

      // Create a notification
      debug(`Debug: Creating notification for user ${userData._id}`);
      let notificationData = await Notificationschema.create({
        user_id: userData._id,
        title: "Login Successful",
        text: notificationMessage,
        user_type: role
      });
      debug(`Debug: Notification created: ${JSON.stringify(notificationData)}`);

      const adminSocketId = getReceiverSocketId(userData._id);
      debug(`Debug: Retrieved socket ID for user ${userData._id}: ${adminSocketId}`);
      if (adminSocketId) {
        debug(`Debug: Emitting newNotification to socket ${adminSocketId}`);
        io.to(adminSocketId).emit("newNotification", notificationData);
      } else {
        debug(`Debug: No socket connection found for user ${userData._id}`);
        console.log("Socket not connected for user:", userData._id);
      }

      debug('Debug: Sending successful login response');

      // Set Authorization header in the response
      res.setHeader('Authorization', `Bearer ${token}`);

      return res.json({
        status: true,
        message: "Successfully logged in",
        token: token,
        userId: userData._id,
        role: userData.role,
        user: {
          id: userData._id,
          role: userData.role,
          phone: userData.phone
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
      debug(`Debug: Error in loginAll: ${error.message}, Stack: ${error.stack}`);
      if (error instanceof NotFound) {
        console.log(error);
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
