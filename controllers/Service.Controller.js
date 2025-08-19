const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const serviceSchema = require("../models/ServiceSchema");
const BaseController = require("./BaseController");
const niv = require("node-input-validator");
const userSchema = require("../models/usersSchema");

module.exports = class ServiceController extends BaseController {
  //add services
  async addService(req, res) {
    try {
      // const tokenData = req.userData;
      // const adminData = await adminSchema.find({ _id: tokenData.id });
      // if (adminData === null) {
      //   throw new NotFound("you are not admin");
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

      const service = await serviceSchema.find({ service_name: req.body.service });
      if (service.length !== 0) {
        throw new Forbidden("this service is available");
      }
      const addServices = new serviceSchema({ service_name: req.body.service });
      const serviceData = await addServices.save();
      return this.sendJSONResponse(
        res,
        "service added",
        {
          length: 1
        },
        serviceData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  //display service from super admin
  async getAllService(req, res) {
    try {
      const serviceData = await serviceSchema.find();
      if (serviceData.length === 0) {
        throw NotFound("service is not available");
      }
      return this.sendJSONResponse(
        res,
        "data retived",
        {
          length: 1
        },
        serviceData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  async getService(req, res) {
    try {
      const serviceData = await serviceSchema.find({ status: 1 });
      if (serviceData.length === 0) {
        throw NotFound("service is not available");
      }
      return this.sendJSONResponse(
        res,
        "data retived",
        {
          length: 1
        },
        serviceData
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse((req, res, error));
    }
  }

  //update service
  async updateService(req, res) {
    try {
      const id = req.query._id;
      // const tokenData = req.userData;
      // const adminData = await adminSchema.find({ _id: tokenData.id });
      // if (adminData === null) {
      //   throw new NotFound("you are not admin");
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
        service_name: req.body.service_name,
        is_deleted: req.body.is_deleted
      };

      const updatedService = await serviceSchema.updateOne({ _id: id }, data);
      return this.sendJSONResponse(
        res,
        "service updated",
        {
          length: 1
        },
        updatedService
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse(req, res, error);
    }
  }

  //delete service
  async deleteService(req, res) {
    try {
      const id = req.params.id;
      // const tokenData = req.userData;
      // const adminData = await adminSchema.find({ _id: tokenData.id });
      // if (adminData === null) {
      //   throw new NotFound("you are not admin");
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

      const updatedService = await serviceSchema.findByIdAndDelete({ _id: id });
      return this.sendJSONResponse(
        res,
        "service updated",
        {
          length: 1
        },
        updatedService
      );
    } catch (error) {
      if (error instanceof NotFound) {
        console.log(error); // throw error;
      }
      return this.sendErrorResponse((req, res, error));
    }
  }
};
