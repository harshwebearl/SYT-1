const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const Notificationschema = require("../models/NotificationSchema");
const mongoose = require("mongoose");
const { io } = require("../socket/socket");
const agencySchema = require("../models/Agency_personalSchema");
const customerSchema = require("../models/customerSchema");

module.exports = class NotificationController extends BaseController {
  async AddNotificationdata(req, res) {
    try {
      const tokenData = req.userData;
      const { title, text, userIds } = req.body;

      let notifications = [];

      if (userIds && userIds.length > 0) {
        notifications = userIds.map((userId) => ({
          title,
          text,
          user_id: userId,
          user_type: "selected_user",
          date_and_time: new Date()
        }));
      } else {
        notifications.push({
          title,
          text,
          user_id: tokenData.id,
          user_type: "admin_and_user",
          date_and_time: new Date()
        });
      }

      const Notificationdatainsert = await Notificationschema.insertMany(notifications);

      io.emit("newNotification", { Notificationdatainsert });

      return this.sendJSONResponse(
        res,
        "Notifications inserted successfully",
        {
          length: Notificationdatainsert.length
        },
        Notificationdatainsert
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async Notificationdataupdate(req, res) {
    try {
      const tokenData = req.userData;

      const { notificationIds } = req.body;

      let updateData = await Notificationschema.updateMany(
        { _id: { $in: notificationIds } }, // Match any notifications where _id is in the provided array
        { status: "read" }, // Update status to "read"
        { new: true } // Return the updated documents
      );

      if (updateData.nModified === 0) {
        return this.sendErrorResponse(req, res, "No notifications were found to update");
      }

      return this.sendJSONResponse(
        res,
        "Notification data update successfully",
        {
          length: updateData.nModified
        },
        updateData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async DisplaynotificationForAgency(req, res) {
    try {
      const tokenData = req.userData;

      // 🔹 Step 1: Fetch Agency Creation Date
      const agency = await agencySchema.findOne({ user_id: tokenData.id }, { createdAt: 1 });

      if (!agency) {
        return this.sendJSONResponse(res, "display Notification", { length: 0 }, []);
      }

      const agencyCreatedAt = agency.createdAt; // Agency creation date
      console.log("agencyCreatedAt", agencyCreatedAt);

      // 🔹 Step 2: Fetch Notifications with Additional Condition
      const notification = await Notificationschema.aggregate([
        {
          $match: {
            $or: [
              { user_id: new mongoose.Types.ObjectId(tokenData.id) }, // Notifications for the specific user
              {
                $and: [
                  { user_type: "agency" },
                  {
                    title: {
                      $in: ["New Travel Requirement Available!", "New Inquiry Received"]
                    }
                  },
                  { createdAt: { $gt: agencyCreatedAt } } // Exclude notifications before agency registration date
                ]
              }
            ]
          }
        },
        { $sort: { createdAt: -1 } } // Sort by the most recent notifications
      ]);

      return this.sendJSONResponse(res, "display Notification", { length: notification.length }, notification);
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error);
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async DisplaynotificationForAdmin(req, res) {
    try {
      const tokenData = req.userData;

      const notification = await Notificationschema.aggregate([
        {
          $match: {
            $or: [
              { user_id: new mongoose.Types.ObjectId(tokenData.id) }, // Match user_id with tokenData.id
              {
                user_type: "admin_and_user",
                title: { $in: ["New Inquiry Received"] } // Specific titles for agencies
              }
            ]
          }
        },
        { $sort: { createdAt: -1 } }
      ]);

      return this.sendJSONResponse(
        res,
        "display Notification ",
        {
          length: 1
        },
        notification
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async DisplaynotificationForCustomer(req, res) {
    try {
      const tokenData = req.userData;

      // Fetch the customer's creation date
      let customerCreate = await customerSchema.findOne({ user_id: tokenData.id }, { createdAt: 1 });
      if (!customerCreate) {
        return this.sendJSONResponse(res, "display Notification", { length: 0 }, []);
      }
      const customerCreatedAt = customerCreate.createdAt; // Customer creation date
      console.log("customerCreatedAt", customerCreatedAt);

      // Fetch notifications created after the customer's registration date
      const notification = await Notificationschema.aggregate([
        {
          $match: {
            $or: [
              { user_id: new mongoose.Types.ObjectId(tokenData.id) }, // Match user_id with tokenData.id
              { user_type: "admin_and_user" }
            ],
            createdAt: { $gt: customerCreatedAt } // Only include notifications created after the customer's registration date
          }
        },
        { $sort: { createdAt: -1 } } // Sort by the most recent notifications
      ]);

      return this.sendJSONResponse(
        res,
        "display Notification",
        {
          length: notification.length
        },
        notification
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
