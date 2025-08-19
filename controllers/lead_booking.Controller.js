const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const lead_booking_schema = require("../models/lead_booking.Schema");
const mongoose = require("mongoose");
const userSchema = require("../models/usersSchema");

module.exports = class lead_booking_Controller extends BaseController {
  async add_lead_booking(req, res) {
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

      const data = {
        agency_id: tokenData.id,
        contact_details: {
          company_name: req.body.contact_details.company_name,
          name: req.body.contact_details.name,
          ISD_code: req.body.contact_details.ISD_code,
          phone: req.body.contact_details.phone,
          budget: req.body.contact_details.budget
        },
        requirements: {
          requirement: req.body.requirements.requirement
        },
        lead_sources: {
          source: req.body.lead_sources.source,
          branch: req.body.lead_sources.branch
        },
        number_of_passengers: {
          adult: req.body.number_of_passengers.adult,
          no_of_children: req.body.number_of_passengers.no_of_children
        },
        services: {
          type_of_service: req.body.services.type_of_service
        },
        travel_infos: {
          travel_date: req.body.travel_infos.travel_date,
          duration: req.body.travel_infos.duration,
          cities: req.body.travel_infos.cities,
          deadline_date: req.body.travel_infos.deadline_date,
          city_name: req.body.travel_infos.city_name,
          customer_type: req.body.travel_infos.customer_type
        }
      };
      const Add_lead_booking = new lead_booking_schema(data);
      const add_lead_booking = await Add_lead_booking.save();
      return this.sendJSONResponse(
        res,
        "lead_booking add",
        {
          length: 1
        },
        add_lead_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error);
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_lead_booking(req, res) {
    try {
      const _id = req.query._id;
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

      const display_cms_visa = await lead_booking_schema.aggregate([
        {
          $match: {
            $or: [{ agency_id: mongoose.Types.ObjectId(tokenData.id) }, { _id: _id }]
          }
        },
        {
          $lookup: {
            from: "branches",
            localField: "lead_sources.branch",
            foreignField: "_id",
            as: "branches"
          }
        },
        {
          $lookup: {
            from: "sources",
            localField: "lead_sources.source",
            foreignField: "_id",
            as: "sources"
          }
        }
      ]);

      return this.sendJSONResponse(
        res,
        "display  lead_booking",
        {
          length: 1
        },
        display_cms_visa
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async display_all_lead_booking(req, res) {
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

      const display_room = await lead_booking_schema.aggregate([
        {
          $lookup: {
            from: "branches",
            localField: "lead_sources.branch",
            foreignField: "_id",
            as: "branches"
          }
        },
        {
          $lookup: {
            from: "sources",
            localField: "lead_sources.source",
            foreignField: "_id",
            as: "sources"
          }
        }
      ]);

      const lead_booking = {
        lead_bookings: display_room
      };
      return this.sendJSONResponse(
        res,
        "lead_booking display",
        {
          length: 1
        },
        lead_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_lead_booking(req, res) {
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
        ref_no: req.body.ref_no,
        date: req.body.date,
        due: req.body.due,
        details: req.body.details,
        client: req.body.client,
        total: req.body.total
      };

      const update_lead_booking = await lead_booking_schema.findByIdAndUpdate({ _id: _id }, Data);
      return this.sendJSONResponse(
        res,
        "update lead_booking",
        {
          length: 1
        },
        update_lead_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_lead_booking_status(req, res) {
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
        status: req.body.status,
        is_deleted: req.body.is_deleted
      };

      const update_lead_booking_status = await lead_booking_schema.findByIdAndUpdate({ _id: _id }, Data);
      return this.sendJSONResponse(
        res,
        "update lead_booking",
        {
          length: 1
        },
        update_lead_booking_status
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_lead_booking(req, res) {
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

      const data = {
        is_deleted: true
      };

      const delete_lead_booking = await lead_booking_schema.findByIdAndUpdate({ _id: _id }, data);

      return this.sendJSONResponse(
        res,
        "delete lead_booking",
        {
          length: 1
        },
        delete_lead_booking
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
