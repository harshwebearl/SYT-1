const BaseController = require("./BaseController");
const NotFound = require('../errors/NotFound');
const Forbidden = require("../errors/Forbidden");
const career_category_schema = require('../models/career_category_Schema');
const userSchema = require("../models/usersSchema");



module.exports = class career_category_controller extends BaseController {

    async add_career_category(req, res) {
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
            const career_categorydata = {
                career_cat_value: req.body.career_cat_value
            }
            const add_career_category = new career_category_schema(career_categorydata);
            const addcareer_category = await add_career_category.save();
            return this.sendJSONResponse(
                res,
                "career_category added",
                {
                    length: 1
                },
                addcareer_category
            );
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

    async display_career_category(req, res) {
        try {
            const career_category = await career_category_schema.find();

            return this.sendJSONResponse(
                res,
                "display career_category",
                {
                    length: 1
                },
                career_category
            );
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

    async update_career_category(req, res) {
        try {
            const career_category_id = req.query._id;
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
            const career_categorydata = {
                career_cat_value: req.body.career_cat_value
            }
            const career_category_data = await career_category_schema.findByIdAndUpdate({ _id: career_category_id }, career_categorydata);
            return this.sendJSONResponse(
                res,
                "updated successfully",
                {
                    length: 1
                },
                career_category_data
            );
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

    async delete_career_category(req, res) {
        try {
            const block_id = req.query._id;
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
            const delete_career_category = await career_category_schema.findByIdAndDelete({ _id: block_id })


            return this.sendJSONResponse(
                res,
                "deleted successfully",
                {
                    length: 1
                },
                delete_career_category
            );

        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

}