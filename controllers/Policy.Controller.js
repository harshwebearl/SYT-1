const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const policySchema = require("../models/PolicySchema");
const BaseController = require("./BaseController");
const jwt = require("jsonwebtoken");
const adminSchema = require("../models/AdminSchema");
const userSchema = require("../models/usersSchema");
const term_and_condition_Schema = require("../models/terms_and_condition_Schema");
module.exports = class PlicyController extends BaseController {
  async Addpolicy(req, res) {
    try {
      // const tokenData = req.userData;
      // const adminData = await adminSchema({ _id: tokenData.id });

      // if (adminData.length === 0) {
      //   throw new Forbidden("you are not admin");
      // }
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData);
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const data = {
        policy_type: req.body.policy_type,
        policy_for: req.body.policy_for,
        policy_content: req.body.policy_content
      };
      const Addpolicy = new policySchema(data);
      const insertpolicy = await Addpolicy.save();
      return this.sendJSONResponse(
        res,
        "data added",
        {
          length: 1
        },
        insertpolicy
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async Add_term_and_condition(req, res) {
    try {
      // const tokenData = req.userData;
      // const adminData = await adminSchema({ _id: tokenData.id });

      // if (adminData.length === 0) {
      //   throw new Forbidden("you are not admin");
      // }
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      console.log(userData);
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const data = {
        term_and_condition_type: req.body.term_and_condition_type,
        term_and_condition_for: req.body.term_and_condition_for,
        term_and_condition_content: req.body.term_and_condition_content
      };
      const Add_term_and_condition = new term_and_condition_Schema(data);
      const inserterm = await Add_term_and_condition.save();
      return this.sendJSONResponse(
        res,
        "data added",
        {
          length: 1
        },
        inserterm
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  //get Policy
  async getPolicy(req, res) {
    try {
      // const policyData = await policySchema.find();
      const termandcondition = await term_and_condition_Schema.find();

      // const result = {
      // policyData: policyData,
      // term_and_condition: termandcondition
      // };

      // const convertjson =  JSON.parse(result[0].term_and_condition)
      // // console.log();
      // console.log(convertjson);

      // console.log(result);

      // function parseData(result) {
      //     if (!result) return {};
      //     if (typeof result === 'string') return JSON.parse(result);
      //     return {};
      // }
      //  if (result) {
      // let resultValue = JSON.parse(result);
      // console.log(resultValue);
      // }

      // var html = convertjson.convert();
      // console.log(html);
      return this.sendJSONResponse(
        res,
        "policy retrived",
        {
          length: 1
        },
        termandcondition
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  //update policy
  async updatePolicy(req, res) {
    try {
      // const decode = req.userData;
      // console.log(decode);
      const id = req.query._id;

      if (req.body.term_and_condition_content == "" || req.body.term_and_condition_content == undefined) {
        throw new Forbidden("Please fill data of term_and_condition_content");
      }

      // const adminData = await adminSchema.find({ _id: decode.id });

      // //check super admin
      // if (adminData[0].admin_status !== 1) {
      //   throw new NotFound("you are not super admin");
      // }
      const tokenData = req.userData;
      if (tokenData === "") {
        return res.status(401).json({
          message: "Auth fail"
        });
      }
      const userData = await userSchema.find({ _id: tokenData.id });
      if (userData[0].role !== "admin") {
        throw new Forbidden("you are not admin");
      }

      const getPolicy = await term_and_condition_Schema.find({ _id: id });
      if (getPolicy.length === 0) {
        throw new NotFound("admin is already exist");
      }

      const policyData = {
        term_and_condition_content: req.body.term_and_condition_content
      };

      const policyResult = await term_and_condition_Schema.findByIdAndUpdate({ _id: id }, policyData);
      return this.sendJSONResponse(
        res,
        "term and condition updated",
        {
          length: 1
        },
        policyResult
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }
};
