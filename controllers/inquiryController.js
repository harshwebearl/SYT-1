const mongoose = require("mongoose");
const Inquiry = require("../models/inquiry");
const userschema = require("../models/usersSchema");
const Notificationschema = require("../models/NotificationSchema");
// const packageSchema = require("../models/packageSchema");
const { getReceiverSocketId, io } = require("../socket/socket");
const package_schema = require("../models/PackageSchema");
const agencySchema = require("../models/Agency_personalSchema");

exports.createInquiry = async (req, res) => {
  try {
    let {
      departure,
      fullname,
      email,
      number,
      state,
      city,
      total_adult,
      total_child,
      total_infants,
      share_with,
      package_id,
      inquiry_date
    } = req.body;

    let newInquiry = new Inquiry({
      departure,
      fullname,
      email,
      number,
      state,
      city,
      total_adult,
      total_child,
      total_infants,
      share_with,
      package_id,
      inquiry_date
    });

    let result = await newInquiry.save();

    if (share_with === "admin") {
      // Send notification to Admin only
      let adminId = await package_schema.findOne({ _id: package_id });

      const adminNotification = await Notificationschema.create({
        user_id: adminId.user_id,
        title: "New Inquiry Received",
        text: `Hello Admin, a new inquiry has been received for the package: ${package_id}. Please review the details and take necessary action.`,
        user_type: "admin"
      });

      io.emit("newNotification", { adminNotification });
    } else if (share_with === "admin and agency") {
      let package = await package_schema.findOne({ _id: package_id });

      let agencyId = await agencySchema.findOne({
        user_id: package.user_id
      });

      if (!agencyId) {
        // Send notification to both Admin and Agency
        const notificationData = await Notificationschema.create({
          user_id: package.user_id,
          title: "New Inquiry Received",
          text: `Hello Admin, a new inquiry has been received for the package: ${package_id}. Please review the details and take necessary action.`,
          user_type: "admin"
        });

        const adminSocketId = getReceiverSocketId(package.user_id);
        if (adminSocketId) {
          io.to(adminSocketId).emit("newNotification", notificationData);
        }
      } else {
        const notificationData = await Notificationschema.create({
          user_id: package.user_id,
          title: "New Inquiry Received",
          text: `Hello Agency, a new inquiry has been received for the package: ${package_id}. Please review the details and take necessary action.`,
          user_type: "agency"
        });

        const adminSocketId = getReceiverSocketId(package.user_id);
        if (adminSocketId) {
          io.to(adminSocketId).emit("newNotification", notificationData);
        }
      }

      // io.emit("newNotification", { adminNotification });
    }

    // const customerNotificationData = await Notificationschema.create({
    //   title: "New Inquiry Insert",
    //   text: `Hello, a new inquiry has been insert for the package: ${package_id}.`,
    //   user_type: "customer"
    // });

    // io.emit("newNotification", { customerNotificationData });

    res.status(200).json({
      success: true,
      message: "Inquiry Insert Successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllInquiries = async (req, res) => {
  try {
    const tokenData = req.userData;
    if (tokenData === "") {
      return res.status(401).json({
        message: "Auth fail"
      });
    }
    const userData = await userschema.find({ _id: tokenData.id });
    if (userData[0].role !== "agency" && userData[0].role !== "admin") {
      throw new Forbidden("you are not agency");
    }

    if (userData[0].role === "agency") {
      const inquiries = await Inquiry.aggregate([
        {
          $match: {
            share_with: "admin and agency"
          }
        },
        {
          $lookup: {
            from: "packages", // The collection for the packages
            localField: "package_id", // Field in Inquiry schema
            foreignField: "_id", // Field in Package schema
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
          $match: {
            "packageDetails.user_id": mongoose.Types.ObjectId(tokenData.id)
          }
        },
        {
          $unwind: {
            path: "$packageDetails", // Unwind the array of packageDetails to get objects
            preserveNullAndEmptyArrays: true // If no matching package is found, still show the inquiry
          }
        },
        {
          $sort: { createdAt: -1 } // Sort by createdAt in descending order
        }
      ]);

      res.status(200).json({
        success: true,
        message: "Inquiries retrieved successfully",
        data: inquiries
      });
    } else if (userData[0].role === "admin") {
      const inquiries = await Inquiry.aggregate([
        {
          $lookup: {
            from: "packages", // Name of the collection that stores package data
            localField: "package_id", // Field in the inquiry schema
            foreignField: "_id", // Field in the package schema (must be ObjectId)
            as: "packageDetails" // The name of the array field in the result where package data will be stored
          }
        },
        {
          $unwind: {
            path: "$packageDetails", // Unwind the array of packageDetails to get objects
            preserveNullAndEmptyArrays: true // If no matching package is found, still show the inquiry
          }
        },
        {
          $sort: { createdAt: -1 } // Sort by createdAt in descending order
        }
      ]);

      res.status(200).json({
        success: true,
        message: "Inquiries retrieved successfully",
        data: inquiries
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getInquiryById = async (req, res) => {
  try {
    const tokenData = req.userData;
    if (tokenData === "") {
      return res.status(401).json({
        message: "Auth fail"
      });
    }
    const userData = await userschema.find({ _id: tokenData.id });
    if (userData[0].role !== "agency" && userData[0].role !== "admin") {
      throw new Forbidden("you are not agency");
    }

    // Aggregation to find the specific inquiry and join with package details
    if (userData[0].role === "agency") {
      const inquiry = await Inquiry.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(req.params.id),
            share_with: "admin and agency"
          }
        },
        {
          $lookup: {
            from: "packages", // The collection for the packages
            localField: "package_id", // Field in Inquiry schema
            foreignField: "_id", // Field in Package schema
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
          $unwind: {
            path: "$packageDetails", // Unwind the array of packageDetails
            preserveNullAndEmptyArrays: true // Show inquiry even if there are no matching packages
          }
        }
      ]);

      // If inquiry is not found
      if (!inquiry || inquiry.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Inquiry not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Inquiry retrieved successfully",
        data: inquiry[0] // Return the first (and only) result from the aggregation
      });
    } else if (userData[0].role === "admin") {
      const inquiry = await Inquiry.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(req.params.id) } // Match the inquiry by its ID
        },
        {
          $lookup: {
            from: "packages", // The collection for the packages
            localField: "package_id", // Field in Inquiry schema
            foreignField: "_id", // Field in Package schema
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
          $unwind: {
            path: "$packageDetails", // Unwind the array of packageDetails
            preserveNullAndEmptyArrays: true // Show inquiry even if there are no matching packages
          }
        }
      ]);

      // If inquiry is not found
      if (!inquiry || inquiry.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Inquiry not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Inquiry retrieved successfully",
        data: inquiry[0] // Return the first (and only) result from the aggregation
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateInquiry = async (req, res) => {
  try {
    const updatedInquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, {
      new: true // Return the updated documen
    });

    if (!updatedInquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Inquiry updated successfully",
      data: updatedInquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    const deletedInquiry = await Inquiry.findByIdAndDelete(req.params.id);

    if (!deletedInquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
