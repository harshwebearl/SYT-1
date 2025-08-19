const Forbidden = require("../errors/Forbidden");
const BaseController = require("./BaseController");
const NotFound = require("../errors/NotFound");
const business_type_schema = require("../models/business_type_schema");

module.exports = class BuinessType extends BaseController {
  async add_business_type(req, res) {
    try {
      const business_type = req.body.business_type;

      const business_type_data = {
        business_type: business_type
      };

      const new_business_type = new business_type_schema(business_type_data);

      const result = await new_business_type.save();

      if (!result) {
        throw new Forbidden("Business Type not added");
      }

      return this.sendJSONResponse(
        res,
        "Business Type Added Succesfully !",
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

  async get_business_type(req, res) {
    try {
      const result = await business_type_schema.find({});

      return this.sendJSONResponse(
        res,
        "Business Type Data!",
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
