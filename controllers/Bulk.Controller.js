const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/Agency_personalSchema");
const sendNotification = require("../config/firebase/firebaseAdmin");
const { sendMails } = require("../utils/sendMails");
const { sendSMS } = require("../utils/sendSMS");

module.exports = class deal_Controller extends BaseController {
  async sendBulkNotifications(req, res) {
    try {
      // AUTH CHECK
      const authInfo = req?.userData;
      if (!authInfo) {
        throw new Error("Auth Failed");
      }
      if (authInfo?.role != "admin") {
        throw new Error("You dont have permission");
      }

      // Logic
      const reqBody = req.body;
      console.log(reqBody);
      if (!reqBody?.to || !reqBody?.scope) {
        throw new Error("Empty or Missing Parameters Passed");
      }
      if (reqBody?.scope != "all" && !reqBody?.list) {
        throw new Error("Must pass Bulk List");
      }

      const result = await userSchema
        .aggregate([
          {
            $match: {
              role: reqBody?.to,
              notificationTokens: { $ne: null }
            }
          },
          {
            $project: {
              _id: 0,
              email_address: 1,
              notificationTokens: 1
            }
          }
        ])
        .then((user) => {
          if (!user?.length) {
            return user;
          } else {
            user.map((element) => {
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
                      title: `${reqBody?.title || "..."}`,
                      body: `${reqBody?.body || "..."}`
                    },
                    data: {
                      title: `${reqBody?.title || "..."}`,
                      body: `${reqBody?.body || "..."}`,
                      message: `${reqBody?.body || "..."}`
                    }
                  },
                  element?.email_address //optional: just for logging
                );
              }
            });
          }

          return user;
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });

      return this.sendJSONResponse(res, "", {}, result);
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
  async sendBulkEmails(req, res) {
    // https://ethereal.email/
    // https://nodemailer.com/about/
    // https://stackoverflow.com/questions/41329056/bulk-email-sending-usiing-node-js
    // https://www.twilio.com/blog/sending-bulk-emails-3-ways-sendgrid-nodejs#:~:text=The%20most%20straightforward%20way%20to,%2Fmail')%3B%20sgMail.
    try {
      // AUTH CHECK
      const authInfo = req?.userData;
      if (!authInfo) {
        throw new Error("Auth Failed");
      }
      if (authInfo?.role != "admin") {
        throw new Error("You dont have permission");
      }

      // Logic
      const reqBody = req.body;
      console.log(reqBody);
      if (!reqBody?.to || !reqBody?.scope) {
        throw new Error("Empty or Missing Parameters Passed");
      }
      if (reqBody?.scope != "all" && !reqBody?.list) {
        throw new Error("Must pass Bulk List");
      }

      let previewURL = "";
      const result = await userSchema
        .aggregate([
          {
            $match: {
              role: reqBody?.to
            }
          },
          {
            $project: {
              _id: 0,
              email: "$email_address"
            }
          }
        ])
        .then(async (user) => {
          if (!user?.length) {
            return user;
          } else {
            // console.log(user);
            previewURL = await sendMails(
              reqBody?.from,
              reqBody?.scope === "all" ? user : JSON.parse(reqBody?.list),
              reqBody?.mailSubject,
              reqBody?.mailPlainText,
              reqBody?.mailHTML
            );
          }
          return user;
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });

      return this.sendJSONResponse(res, "", {}, previewURL);
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
  async sendBulkSMSs(req, res, next) {
    const { isdCode, toPhone, msgBody } = req.body;

    const result = await sendSMS(isdCode, toPhone, msgBody);
    console.log(2, result);

    return res.status(200).json({ result, msg: "Successfully sent" });
  }
};
