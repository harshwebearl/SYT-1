const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");
const faq_Schema = require("../models/faq_schema");
const mongoose = require("mongoose");

module.exports = class faq_Controller extends BaseController {
  async add_faq(req, res) {
    try {
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not agency");
      }

      const faq_data = {
        question: req.body.question,
        answer: req.body.answer
      };

      const new_faq = new faq_Schema(faq_data);

      const result = await new_faq.save();

      if (!result) {
        throw new Forbidden("Error while adding FAQS");
      }

      return this.sendJSONResponse(
        res,
        "FAQ Added Succesfully !",
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

  async get_faq(req, res) {
    try {
      const result = await faq_Schema.find({});

      return this.sendJSONResponse(
        res,
        "display faq list",
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

  async get_faq_byid(req, res) {
    try {
      const faq_id = req.query._id;

      const result = await faq_Schema.findById(faq_id);

      return this.sendJSONResponse(
        res,
        "display faq",
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

  async update_faq(req, res) {
    try {
      const faq_id = req.query._id;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not agency");
      }

      const faq_data = {
        question: req.body.question,
        answer: req.body.answer
      };

      const result = await faq_Schema.findByIdAndUpdate(faq_id, faq_data, { new: true });

      return this.sendJSONResponse(
        res,
        "FAQ update Succesfully !",
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

  async delete_faq(req, res) {
    try {
      const faq_id = req.query._id;
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not agency");
      }

      const result = await faq_Schema.findByIdAndDelete(faq_id);

      return this.sendJSONResponse(
        res,
        "FAQ deleted Succesfully !",
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
