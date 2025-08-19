const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const notification_setting_Schema = require("../models/notification_settings.Schema");
const mongoose = require("mongoose");

module.exports = class notification_setting_Controller extends BaseController {
  async add_notification_setting(req, res) {
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

      const Data = {
        agency_id: tokenData.id,
        sms: {
          birthday: req.body.sms.birthday,
          anniversary: req.body.sms.anniversary,
          followup_reminder: req.body.sms.followup_reminder,
          lead_allocation: req.body.sms.lead_allocation,
          quotation_sharing: req.body.sms.quotation_sharing,
          quotation_replay: req.body.sms.quotation_replay,
          auto_invoice: req.body.sms.auto_invoice,
          manual_invoice: req.body.sms.manual_invoice,
          customer_payment_reminder: req.body.sms.customer_payment_reminder,
          supplier_payment_receipt: req.body.sms.supplier_payment_receipt,
          hotel_voucher: req.body.sms.hotel_voucher,
          transfer_voucher: req.body.sms.transfer_voucher,
          booking_confirmation_letter: req.body.sms.booking_confirmation_letter,
          other_service_Quotation: req.body.sms.other_service_Quotation,
          web_leads: req.body.sms.web_leads,
          trip_reminder: req.body.sms.trip_reminder,
          notify_customer: req.body.sms.notify_customer,
          b2b_quotation_sharing: req.body.sms.b2b_quotation_sharing,
          otp: req.body.sms.otp,
          account_registration: req.body.sms.account_registration,
          flight_booking: req.body.sms.flight_booking,
          flight_cancellation: req.body.sms.flight_cancellation,
          package_booking: req.body.sms.package_booking,
          package_cancellation: req.body.sms.package_cancellation,
          hotel_booking: req.body.sms.hotel_booking,
          hotel_cancellation: req.body.sms.hotel_cancellation,
          activity_booking: req.body.sms.activity_booking,
          activity_cancellation: req.body.sms.activity_cancellation,
          visa_booking: req.body.sms.visa_booking,
          visa_cancellation: req.body.sms.visa_cancellation,
          query: req.body.sms.query
        },
        email: {
          birthday: req.body.email.birthday,
          anniversary: req.body.email.anniversary,
          followup_reminder: req.body.email.followup_reminder,
          lead_allocation: req.body.email.lead_allocation,
          quotation_sharing: req.body.email.quotation_sharing,
          quotation_replay: req.body.email.quotation_replay,
          auto_invoice: req.body.email.auto_invoice,
          manual_invoice: req.body.email.manual_invoice,
          customer_payment_reminder: req.body.email.customer_payment_reminder,
          supplier_payment_receipt: req.body.email.supplier_payment_receipt,
          hotel_voucher: req.body.email.hotel_voucher,
          transfer_voucher: req.body.email.transfer_voucher,
          booking_confirmation_letter: req.body.email.booking_confirmation_letter,
          other_service_Quotation: req.body.email.other_service_Quotation,
          web_leads: req.body.email.web_leads,
          trip_reminder: req.body.email.trip_reminder,
          notify_customer: req.body.email.notify_customer,
          b2b_quotation_sharing: req.body.email.b2b_quotation_sharing,
          otp: req.body.email.otp,
          account_registration: req.body.email.account_registration,
          flight_booking: req.body.email.flight_booking,
          flight_cancellation: req.body.email.flight_cancellation,
          package_booking: req.body.email.package_booking,
          package_cancellation: req.body.email.package_cancellation,
          hotel_booking: req.body.email.hotel_booking,
          hotel_cancellation: req.body.email.hotel_cancellation,
          activity_booking: req.body.email.activity_booking,
          activity_cancellation: req.body.email.activity_cancellation,
          visa_booking: req.body.email.visa_booking,
          visa_cancellation: req.body.email.visa_cancellation,
          query: req.body.email.query
        },
        whatsapp: {
          birthday: req.body.email.birthday,
          anniversary: req.body.email.anniversary,
          followup_reminder: req.body.email.followup_reminder,
          lead_allocation: req.body.email.lead_allocation,
          quotation_sharing: req.body.email.quotation_sharing,
          quotation_replay: req.body.email.quotation_replay,
          auto_invoice: req.body.email.auto_invoice,
          manual_invoice: req.body.email.manual_invoice,
          customer_payment_reminder: req.body.email.customer_payment_reminder,
          supplier_payment_receipt: req.body.email.supplier_payment_receipt,
          hotel_voucher: req.body.email.hotel_voucher,
          transfer_voucher: req.body.email.transfer_voucher,
          booking_confirmation_letter: req.body.email.booking_confirmation_letter,
          other_service_Quotation: req.body.email.other_service_Quotation,
          web_leads: req.body.email.web_leads,
          trip_reminder: req.body.email.trip_reminder,
          notify_customer: req.body.email.notify_customer,
          b2b_quotation_sharing: req.body.email.b2b_quotation_sharing,
          otp: req.body.email.otp,
          account_registration: req.body.email.account_registration,
          flight_booking: req.body.email.flight_booking,
          flight_cancellation: req.body.email.flight_cancellation,
          package_booking: req.body.email.package_booking,
          package_cancellation: req.body.email.package_cancellation,
          hotel_booking: req.body.email.hotel_booking,
          hotel_cancellation: req.body.email.hotel_cancellation,
          activity_booking: req.body.email.activity_booking,
          activity_cancellation: req.body.email.activity_cancellation,
          visa_booking: req.body.email.visa_booking,
          visa_cancellation: req.body.email.visa_cancellation,
          query: req.body.email.query
        },
        is_deleted: req.body.is_deleted
      };

      const add_notification_setting = new notification_setting_Schema(Data);
      const Add_notification_settingadd_notification_setting = await add_notification_setting.save();
      return this.sendJSONResponse(
        res,
        "add notification_settingadd_notification_setting",
        {
          length: 1
        },
        Add_notification_settingadd_notification_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_notification_setting(req, res) {
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

      const _id = req.query._id;

      const Data = {
        agency_id: tokenData.id,
        is_deleted: req.body.is_deleted,
        sms: req.body.sms,
        email: req.body.email,
        whatsapp: req.body.whatsapp
      };

      const update_notification_setting = await notification_setting_Schema.findByIdAndUpdate(
        { _id: _id, agency_id: tokenData.id },
        Data
      );
      return this.sendJSONResponse(
        res,
        "update notification_setting",
        {
          length: 1
        },
        update_notification_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async get_notification_setting(req, res) {
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

      const _id = req.query._id;

      const get_notification_setting = await notification_setting_Schema.findById({
        _id: _id,
        agency_id: tokenData.id
      });
      return this.sendJSONResponse(
        res,
        "get notification_setting",
        {
          length: 1
        },
        get_notification_setting
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
