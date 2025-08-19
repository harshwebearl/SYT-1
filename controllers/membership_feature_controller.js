const BaseController = require("./BaseController");
const NotFound = require('../errors/NotFound');
const Forbidden = require("../errors/Forbidden");
const membership_feature_schema = require('../models/membership_feature_schema');
const CapitalizeFirstLetter = require("../utils/uppercase_function");
const userSchema = require("../models/usersSchema");
const mongoose = require('mongoose');
module.exports = class membership_feature_controller extends BaseController {

    async add_membership_feature(req, res) {
        try {
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

            const feature_namedata = {
                feature_name: CapitalizeFirstLetter(req.body.feature_name)
            }
            const feature_name_data = new membership_feature_schema(feature_namedata);
            const feature_name = await feature_name_data.save();
            return this.sendJSONResponse(
                res,
                "feature added",
                {
                    length: 1
                },
                feature_name
            );
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

    async display_membership_feature(req, res) {
        try {
            const feature_name = await membership_feature_schema.find();

            return this.sendJSONResponse(
                res,
                "display feature",
                {
                    length: 1
                },
                feature_name
            );
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

    async display_membership_feature_byid(req, res) {
        try {
            const id = req.query._id;
            const feature_name = await membership_feature_schema.find({ _id: mongoose.Types.ObjectId(id) });

            return this.sendJSONResponse(
                res,
                "display feature",
                {
                    length: 1
                },
                feature_name
            );
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

    async update_membership_feature(req, res) {
        try {
            const feature_name_id = req.query._id;
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

            const feature_namedata = {
                feature_name: CapitalizeFirstLetter(req.body.feature_name)
            }
            const feature_name_data = await membership_feature_schema.findByIdAndUpdate({ _id: feature_name_id }, feature_namedata);
            return this.sendJSONResponse(
                res,
                "updated successfully",
                {
                    length: 1
                },
                feature_name_data
            );
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

    async delete_membership_feature(req, res) {
        try {
            const feature_name_id = req.query._id;
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

            const delete_feature_name = await membership_feature_schema.findByIdAndDelete({ _id: feature_name_id })
            return this.sendJSONResponse(
                res,
                "deleted successfully",
                {
                    length: 1
                },
                delete_feature_name
            );

        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

}