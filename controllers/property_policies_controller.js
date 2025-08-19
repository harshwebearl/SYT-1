const NotFound = require("../errors/NotFound");
const Forbidden = require("../errors/Forbidden");
const BaseController = require("./BaseController");
const property_policies_schema = require("../models/property_policies_schema");
const userSchema = require("../models/usersSchema");
const { default: mongoose } = require("mongoose");

module.exports = class room_controller_controller extends BaseController {
  async add_property_policies(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency") {
        throw new Forbidden("you are not admin or agency");
      }

      const property_result = await property_policies_schema.findOne({ hotel_id: req.body.hotel_id });

      if (property_result != null) {
        throw new Forbidden("Your Hotel has already one polciiy ! please try to remove it or update it");
      }

      const property_policies_data = {
        hotel_id: req.body.hotel_id,
        policy_title: req.body.policy_title,
        policy_description: req.body.policy_description,
        infant: req.body.infant,
        children: req.body.children,
        adult_and_above: req.body.adult_and_above,
        infant_points: req.body.infant_points,
        childern_points: req.body.childern_points,
        adult_and_above_points: req.body.adult_and_above_points,
        policy_other: req.body.policy_other
      };

      const new_property_policies = new property_policies_schema(property_policies_data);

      const result = await new_property_policies.save();

      if (result.length == 0) {
        throw new Forbidden("Unable to add property and polcies ! retry");
      }

      return this.sendJSONResponse(
        res,
        "Property Policies Added Syccesfully !",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async read_property_policies_by_hotelid(req, res) {
    try {
      const hotel_id = req.query.hotel_id;

      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency" && userData[0].role !== "customer") {
        throw new Forbidden("you are not admin or agency or customer");
      }

      const privacy_policies_data = await property_policies_schema.aggregate([
        {
          $match: {
            hotel_id: mongoose.Types.ObjectId(hotel_id)
          }
        },
        {
          $lookup: {
            from: "hotel_syts",
            localField: "hotel_id",
            foreignField: "_id",
            as: "hotel_details"
          }
        },
        {
          $project: {
            "_id": 1,
            "hotel_id": 1,
            "policy_title": 1,
            "policy_description": 1,
            "infant": 1,
            "children": 1,
            "adult_and_above": 1,
            "infant_points": 1,
            "childern_points": 1,
            "adult_and_above_points": 1,
            "policy_other": 1,
            "createdAt": 1,
            "updatedAt": 1,
            "hotel_details._id": 1,
            "hotel_details.hotel_name": 1,
            "hotel_details.hotel_address": 1
          }
        }
      ]);

      if (privacy_policies_data == null) {
        throw new Forbidden("No privacy policy found");
      }

      return this.sendJSONResponse(
        res,
        "Property Policies data!",
        {
          length: 1
        },
        privacy_policies_data
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async read_property_policies_by_property_and_policies_id(req, res) {
    try {
      const property_and_policies_id = req.query._id;

      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency" && userData[0].role !== "customer") {
        throw new Forbidden("you are not admin or agency or customer");
      }

      const privacy_policies_data = await property_policies_schema.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(property_and_policies_id)
          }
        },
        {
          $lookup: {
            from: "hotel_syts",
            localField: "hotel_id",
            foreignField: "_id",
            as: "hotel_details"
          }
        },
        {
          $project: {
            _id: 1,
            hotel_id: 1,
            policy_title: 1,
            policy_description: 1,
            infant: 1,
            children: 1,
            adult_and_above: 1,
            infant_points: 1,
            childern_points: 1,
            adult_and_above_points: 1,
            policy_other: 1,
            hotel_details: {
              _id: 1,
              hotel_name: 1,
              hotel_address: 1
            }
          }
        }
      ]);

      if (privacy_policies_data == null) {
        throw new Forbidden("No privacy policy found");
      }

      return this.sendJSONResponse(
        res,
        "Property Policies data!",
        {
          length: 1
        },
        privacy_policies_data
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async update_property_policies(req, res) {
    try {
      const hotel_id = req.query._id;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency") {
        throw new Forbidden("you are not admin or agency");
      }

      const property_policies_data = {
        policy_title: req.body.policy_title,
        policy_description: req.body.policy_description,
        infant: req.body.infant,
        children: req.body.children,
        adult_and_above: req.body.adult_and_above,
        infant_points: req.body.infant_points,
        childern_points: req.body.childern_points,
        adult_and_above_points: req.body.adult_and_above_points,
        policy_other: req.body.policy_other
      };

      const result = await property_policies_schema.updateOne({ hotel_id: hotel_id }, property_policies_data, {
        new: true
      });

      if (result.length == 0) {
        throw new Forbidden("Unable to update property and polcies ! retry");
      }

      return this.sendJSONResponse(
        res,
        "Privacy Policies Updated Succesfully !",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async delete_property_polciies(req, res) {
    try {
      const hotel_id = req.query._id;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });

      if (userData[0].role !== "admin" && userData[0].role !== "agency") {
        throw new Forbidden("you are not admin or agency");
      }

      const result = await property_policies_schema.deleteOne({ hotel_id: hotel_id });

      if (result.length == 0) {
        throw new Forbidden("Unable to delete property and polcies ! retry");
      }

      return this.sendJSONResponse(
        res,
        "Privacy Policies deleted Succesfully !",
        {
          length: 1
        },
        result
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
