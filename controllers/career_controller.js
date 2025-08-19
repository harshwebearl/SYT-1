const BaseController = require("./BaseController");
const NotFound = require('../errors/NotFound');
const Forbidden = require("../errors/Forbidden");
const career_schema = require('../models/career_schema');
const admin_schema = require("../models/AdminSchema");
const userSchema = require("../models/usersSchema");
const { default: mongoose } = require("mongoose");

module.exports = class career_controller extends BaseController {

    async add_career(req, res) {
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

            const careerdata = {
                career_title: req.body.career_title,
                career_desc: req.body.career_desc,
                career_tag: req.body.career_tag,
                career_category_id: req.body.career_category_id
            }
            const add_career = new career_schema(careerdata);
            const addcareer = await add_career.save();
            return this.sendJSONResponse(
                res,
                "career added",
                {
                    length: 1
                },
                addcareer
            );
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

    async display_career(req, res) {
        try {
            const _id = req.query.career_category_id;

            const career = await career_schema.aggregate([
                {
                    $match: { career_category_id: mongoose.Types.ObjectId(_id) }
                },
                {
                    $lookup: {
                        from: "career_categories",
                        localField: "career_category_id",
                        foreignField: "_id",
                        as: "career_categories"
                    }
                },
                {
                    $addFields: { career_cat_value: { $first: "$career_categories.career_cat_value" } }
                },
                {
                    $project: {
                        _id: 1,
                        career_title: 1,
                        career_desc: 1,
                        career_tag: 1,
                        career_category_id: 1,
                        career_cat_value: 1
                    }
                }
            ]);

            return this.sendJSONResponse(
                res,
                "display career",
                {
                    length: 1
                },
                career
            );
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }


    async display_career_by_id(req, res) {
        try {
            const _id = req.query._id;

            const career = await career_schema.aggregate([
                {
                    $match: { _id: mongoose.Types.ObjectId(_id) }
                },
                {
                    $lookup: {
                        from: "career_categories",
                        localField: "career_category_id",
                        foreignField: "_id",
                        as: "career_categories"
                    }
                },
                {
                    $addFields: { career_cat_value: { $first: "$career_categories.career_cat_value" } }
                },
                {
                    $project: {
                        _id: 1,
                        career_title: 1,
                        career_desc: 1,
                        career_tag: 1,
                        career_category_id: 1,
                        career_cat_value: 1
                    }
                }
            ]);

            return this.sendJSONResponse(
                res,
                "display career",
                {
                    length: 1
                },
                career
            );
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

    async update_career(req, res) {
        try {
            const career_id = req.query._id;
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

            const careerdata = {
                career_title: req.body.career_title,
                career_desc: req.body.career_desc,
                career_tag: req.body.career_tag,
                career_category_id: req.body.career_category_id
            }
            const career_data = await career_schema.findByIdAndUpdate({ _id: career_id }, careerdata);
            return this.sendJSONResponse(
                res,
                "updated successfully",
                {
                    length: 1
                },
                career_data
            );
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

    async delete_career(req, res) {
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
            const delete_career = await career_schema.findByIdAndDelete({ _id: block_id })


            return this.sendJSONResponse(
                res,
                "deleted successfully",
                {
                    length: 1
                },
                delete_career
            );

        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }


}