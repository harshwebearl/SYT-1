const express = require("express");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const adminSchema = require("../models/AdminSchema");
const userSchema = require("../models/usersSchema");
const customerSchema = require("../models/customerSchema");
const CustomRequirementSchema = require("../models/custom_requirementsSchema");
const Notificationschema = require("../models/NotificationSchema.js");
const { generateFilePathForDB, generateFileDownloadLinkPrefix } = require("../utils/utility");
const image_url = require("../update_url_path.js");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Otp = require("../models/otp.js");
const axios = require("axios");
const { getReceiverSocketId, io } = require("../socket/socket.js");
const BaseController = require("./BaseController");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = class UserController extends BaseController {
// Register a new user
  async register(req, res) {
    try {
      const { phone, password, email_address, name, referal_code, gender, state, city } = req.body;

      // Validate required fields
      if (!phone || !password || !email_address || !name) {
        throw new Forbidden("Phone, password, email, and name are required");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Check if phone is already registered
      const existingUser = await userSchema.findOne({ phone, role: "customer" });
      if (existingUser) {
        throw new Forbidden("Phone number is already registered");
      }

      // Check if email is already registered
      const existingCustomer = await customerSchema.findOne({ email_address });
      if (existingCustomer) {
        throw new Forbidden("Email is already registered");
      }

      // Create user in userSchema
      const userData = new userSchema({
        phone,
        password: hashedPassword,
        email_address,
        role: "customer"
      });
      const savedUser = await userData.save();

      // Create customer data
      const customerData = new customerSchema({
        user_id: savedUser._id,
        name,
        email_address,
        referal_code,
        gender,
        state,
        city
      });
      const savedCustomer = await customerData.save();

      // Create notification
      const notification = await Notificationschema.create({
        user_id: savedUser._id,
        title: "User Registration Successful",
        text: `Hello ${name}, thank you for registering with Start Your Tour! We're thrilled to have you on board. Explore exciting destinations and make your journey unforgettable.`,
        user_type: "customer"
      });

      // Emit socket notification
      const socketId = getReceiverSocketId(savedUser._id);
      if (socketId) {
        io.to(socketId).emit("newNotification", notification);
      }

      return this.sendJSONResponse(res, "User registered", { length: 1 }, savedCustomer);
    } catch (error) {
      console.error("Registration error:", error);
      return this.sendErrorResponse(req, res, error);
    }
  }

  // Display user details by admin
  async display_all_user_detail_by_admin(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      // Verify admin role
      const user = await userSchema.findOne({ _id: new mongoose.Types.ObjectId(tokenData.id) });
      if (!user || user.role !== "admin") {
        throw new Forbidden("You are not an admin");
      }

      const userId = req.query._id;
      if (!mongoose.isValidObjectId(userId)) {
        throw new Forbidden("Invalid user ID");
      }

      // Aggregate user details
      const userDetails = await userSchema.aggregate([
        {
          $match: {
            $and: [
              { _id: new mongoose.Types.ObjectId(userId) },
              { role: "customer" }
            ]
          }
        },
        {
          $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "user_id",
            as: "customer_details",
            pipeline: [{ $project: { password: 0 } }]
          }
        },
        {
          $lookup: {
            from: "custom_requirements",
            localField: "_id",
            foreignField: "user_id",
            as: "custom_requirement",
            pipeline: [
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
                  from: "book_packages",
                  localField: "_id",
                  foreignField: "custom_package_id",
                  as: "book_packages"
                }
              },
              {
                $lookup: {
                  from: "bids",
                  localField: "_id",
                  foreignField: "custom_requirement_id",
                  as: "bids_details"
                }
              }
            ]
          }
        },
        { $project: { password: 0 } }
      ]);

      // Update photo URLs
      for (const user of userDetails) {
        for (const detail of user.customer_details) {
          if (detail.photo) {
            detail.photo = await image_url("users", detail.photo);
          }
        }
      }

      return this.sendJSONResponse(res, "User details retrieved", { length: userDetails.length }, userDetails);
    } catch (error) {
      console.error("Error fetching user details:", error);
      return this.sendErrorResponse(req, res, error);
    }
  }

  // Display all users by admin
  async display_all_user_list_by_admin(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      // Verify admin role
      const user = await userSchema.findOne({ _id: new mongoose.Types.ObjectId(tokenData.id) });
      if (!user || user.role !== "admin") {
        throw new Forbidden("You are not an admin");
      }

      // Aggregate user list
      const userList = await userSchema.aggregate([
        { $match: { role: "customer" } },
        {
          $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "user_id",
            as: "customer_details",
            pipeline: [{ $project: { password: 0 } }]
          }
        },
        { $project: { password: 0 } }
      ]);

      // Update photo URLs
      for (const user of userList) {
        for (const detail of user.customer_details) {
          if (detail.photo) {
            detail.photo = await image_url("users", detail.photo);
          }
        }
      }

      return this.sendJSONResponse(res, "User list retrieved", { length: userList.length }, userList);
    } catch (error) {
      console.error("Error fetching user list:", error);
      return this.sendErrorResponse(req, res, error);
    }
  }

  // Get all users
  async getUsers(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      // Verify admin role
      const user = await userSchema.findOne({ _id: new mongoose.Types.ObjectId(tokenData.id) });
      if (!user || user.role !== "admin") {
        throw new Forbidden("You are not an admin");
      }

      const users = await userSchema.find().select("-password");
      if (!users.length) {
        throw new NotFound("No users found");
      }

      return this.sendJSONResponse(res, "Users retrieved", { length: users.length }, users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return this.sendErrorResponse(req, res, error);
    }
  }

  // Update user password
  async updatePassword(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      const { old_password, new_password } = req.body;
      if (!old_password || !new_password) {
        throw new Forbidden("Old and new passwords are required");
      }

      // Verify user and password
      const user = await userSchema.findOne({ _id: new mongoose.Types.ObjectId(tokenData.id) });
      if (!user) {
        throw new NotFound("User not found");
      }

      const isPasswordValid = await bcrypt.compare(old_password, user.password);
      if (!isPasswordValid) {
        throw new Forbidden("Old password is incorrect");
      }

      // Update password
      const hashedNewPassword = await bcrypt.hash(new_password, 10);
      await userSchema.findByIdAndUpdate(tokenData.id, { password: hashedNewPassword });

      // Create notification
      const notification = await Notificationschema.create({
        user_id: tokenData.id,
        title: "Password Successfully Changed",
        text: "Your password has been successfully updated.",
        user_type: "customer"
      });

      // Emit socket notification
      const socketId = getReceiverSocketId(tokenData.id);
      if (socketId) {
        io.to(socketId).emit("newNotification", notification);
      }

      return this.sendJSONResponse(res, "Password changed", { length: 1 }, { success: true });
    } catch (error) {
      console.error("Error updating password:", error);
      return this.sendErrorResponse(req, res, error);
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      // Verify admin role
      const admin = await userSchema.findOne({ _id: new mongoose.Types.ObjectId(tokenData.id) });
      if (!admin || admin.role !== "admin") {
        throw new Forbidden("You are not an admin");
      }

      const userId = req.params.id;
      if (!mongoose.isValidObjectId(userId)) {
        throw new Forbidden("Invalid user ID");
      }

      const deletedUser = await userSchema.findByIdAndUpdate(
        userId,
        { status: 0, status_change_by: tokenData.id },
        { new: true }
      );
      if (!deletedUser) {
        throw new NotFound("User not found");
      }

      return this.sendJSONResponse(res, "User deleted", { length: 1 }, deletedUser);
    } catch (error) {
      console.error("Error deleting user:", error);
      return this.sendErrorResponse(req, res, error);
    }
  }

  // Get user profile
  async userInfo(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      // Verify customer role
      const user = await userSchema.findOne({ _id: new mongoose.Types.ObjectId(tokenData.id) });
      if (!user || user.role !== "customer") {
        throw new Forbidden("You are not a customer");
      }

      // Aggregate user info
      const userInfo = await userSchema.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(tokenData.id) } },
        {
          $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "user_id",
            as: "user_details"
          }
        },
        {
          $addFields: {
            user_details: {
              $map: {
                input: "$user_details",
                as: "userDetail",
                in: {
                  $mergeObjects: [
                    "$$userDetail",
                    {
                      photo: { $ifNull: ["$$userDetail.photo", null] }
                    }
                  ]
                }
              }
            }
          }
        },
        { $project: { password: 0 } }
      ]);

      // Update photo URLs
      for (const user of userInfo) {
        for (const detail of user.user_details) {
          if (detail.photo) {
            detail.photo = await image_url("users", detail.photo);
          }
        }
      }

      return this.sendJSONResponse(res, "User retrieved", { length: userInfo.length }, userInfo);
    } catch (error) {
      console.error("Error fetching user info:", error);
      return this.sendErrorResponse(req, res, error);
    }
  }

  // Get user history
  async usershistory(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        throw new Forbidden("Authentication failed");
      }

      // Determine user ID based on role
      let userId;
      const user = await userSchema.findOne({ _id: new mongoose.Types.ObjectId(tokenData.id) });
      if (!user) {
        throw new NotFound("User not found");
      }
      if (user.type !== "admin" && user.type !== "user") {
        throw new Forbidden("You don't have permission");
      }
      userId = user.type === "admin" ? req.query.userId : tokenData.id;

      if (!mongoose.isValidObjectId(userId)) {
        throw new Forbidden("Invalid user ID");
      }

      // Aggregate user history
      const userHistory = await CustomRequirementSchema.aggregate([
        { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "book_packages",
            localField: "_id",
            foreignField: "custom_package_id",
            as: "book_packages"
          }
        }
      ]);

      return this.sendJSONResponse(res, "User history retrieved", { length: userHistory.length }, userHistory);
    } catch (error) {
      console.error("Error fetching user history:", error);
      return this.sendErrorResponse(req, res, error);
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const tokenData = req.userData;
      if (!tokenData) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      const { name, address, state, city, email_address } = req.body;
      const data = { name, address, state, city, email_address };

      // Handle file upload
      if (req.file) {
        data.photo = req.file.filename;
      }

      // Update customer profile
      const updatedUser = await customerSchema.findOneAndUpdate(
        { user_id: new mongoose.Types.ObjectId(tokenData.id) },
        data,
        { new: true }
      );
      if (!updatedUser) {
        throw new NotFound("User not found");
      }

      return this.sendJSONResponse(res, "User profile updated", { length: 1 }, updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      return this.sendErrorResponse(req, res, error);
    }
  }

  // Check mobile number
  async checkmobile_number(req, res) {
    try {
      const { mobile_number } = req.body;
      if (!mobile_number) {
        throw new Forbidden("Mobile number is required");
      }

      const user = await userSchema.findOne({ mobile_number });
      if (!user) {
        throw new Forbidden("Mobile number is not registered");
      }

      return this.sendJSONResponse(res, "Mobile number matched", { length: 1 }, { success: true });
    } catch (error) {
      console.error("Error checking mobile number:", error);
      return this.sendErrorResponse(req, res, error);
    }
  }

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const { phone, newpassword } = req.body;
      if (!phone || !newpassword) {
        throw new Forbidden("Phone and new password are required");
      }

      // Find user by phone
      const user = await userSchema.findOne({ phone });
      if (!user) {
        throw new NotFound("User not found");
      }

      // Update password
      const hashedNewPassword = await bcrypt.hash(newpassword, 10);
      await userSchema.findByIdAndUpdate(user._id, { password: hashedNewPassword });

      return this.sendJSONResponse(res, "Password changed successfully", { length: 1 }, { success: true });
    } catch (error) {
      console.error("Error resetting password:", error);
      return this.sendErrorResponse(req, res, error);
    }
  }

  // Send OTP
  async send_otp(req, res) {
    try {
      const { contact, status } = req.body;

      // Validate contact number
      if (!contact || contact.length !== 10 || isNaN(contact)) {
        throw new Forbidden("Invalid phone number");
      }

      const number = `+91${contact}`;
      const randomOtp = Math.floor(Math.random() * 900000) + 100000; // 6-digit OTP

      // Check user registration status
      const existingUser = await userSchema.findOne({ phone: contact, role: "customer" });
      if (status === "register" && existingUser) {
        throw new Forbidden("Phone number is already registered");
      }
      if (status === "forgot" && !existingUser) {
        throw new Forbidden("Phone number is not registered");
      }

      // Send OTP via SMS
      const smsUrl = `https://rslri.connectbind.com:8443/bulksms/bulksms?username=DG35-webearl&password=digimile&type=0&dlr=1&destination=${number}&source=WEBEAR&message=Dear User, Your one time password is ${randomOtp} and it is valid for 10 minutes. Do not share it to anyone. Thank you, Team WEBEARL TECHNOLOGIES.&entityid=1101602010000073269&tempid=1107169899584811565`;
      const response = await axios.get(smsUrl);

      if (response.status !== 200) {
        throw new Error("Failed to send OTP");
      }

      // Save OTP
      await Otp.findOneAndUpdate(
        { contact },
        { $set: { otp: randomOtp } },
        { upsert: true, new: true }
      );

      return this.sendJSONResponse(res, "OTP sent successfully", { length: 1 }, { contact, otp: randomOtp });
    } catch (error) {
      console.error("Error sending OTP:", error);
      return this.sendErrorResponse(req, res, error);
    }
  }

  // Verify OTP
  async verify_otp(req, res) {
    try {
      const { otp, contact } = req.body;
      if (!otp || !contact) {
        throw new Forbidden("OTP and contact are required");
      }

      const otpData = await Otp.findOne({ contact });
      if (!otpData) {
        throw new Forbidden("User not found");
      }

      if (otp !== otpData.otp) {
        throw new Forbidden("Invalid OTP");
      }

      // Clear OTP after verification
      await Otp.findOneAndUpdate({ contact }, { $set: { otp: null } });

      return this.sendJSONResponse(res, "OTP verified successfully", { length: 1 }, { success: true });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return this.sendErrorResponse(req, res, error);
    }
  }
};
