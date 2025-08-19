const BaseController = require("./BaseController");
const NotFound = require('../errors/NotFound');
const Forbidden = require("../errors/Forbidden");
const plan_schema = require('../models/membership_plan_schema');
// const admin_schema = require("../models/admin_detail_schema");
const membership_feature_schema = require('../models/membership_feature_schema');
// const NewData = require('../models/newDataSchema');
const userSchema = require("../models/usersSchema");
const { default: mongoose } = require("mongoose");

module.exports = class plan_controller extends BaseController {

    async add_plan(req, res) {
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

            const plan_namedata = {
                plan_name: req.body.plan_name,
                plan_days: req.body.plan_days,
                plan_original_price: req.body.plan_original_price,
                plan_selling_price: req.body.plan_selling_price,
                membership_feature_id: req.body.membership_feature_id.membership_id,
                membership_feature_id: req.body.membership_feature_id.membership_feature_status,
                contact_limit: req.body.contact_limit,
                status: req.body.status,
                sequence: req.body.sequence
            }
            console.log(plan_namedata);
            //     let checkExist = await membership_feature_schema.aggregate([
            //      {
            //          $match: {
            //              me
            //          }
            //      }
            //     ]);
            //     if (checkExist.length > 0) {
            //        return res.status(200).json({ isSuccess: true, status: 1, data: [], message: "feature not exist" })
            //    }
            const plan_name_data = new plan_schema(req.body);
            const plan_name = await plan_name_data.save();
            return this.sendJSONResponse(
                res,
                "membership plan added",
                {
                    length: 1
                },
                plan_name
            );
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

    async display_plan(req, res) {
        try {
            const plans = await plan_schema.aggregate([
                {
                    $match: { status: 'active' }
                },
                {
                    $lookup: {
                        from: "membership_features",
                        localField: "membership_feature_id.membership_id",
                        foreignField: "_id",
                        as: "membership_feature_name"
                    }
                },
                {
                    $sort: { sequence: 1 }
                }
            ]);

            return this.sendJSONResponse(
                res,
                "display membership plans",
                {
                    length: plans.length
                },
                plans
            );
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }


    async display_plan_with_id(req, res) {
        try {
            const id = req.query._id;
            const display_plan_with_id = await plan_schema.aggregate([
                {
                    $match: { _id: mongoose.Types.ObjectId(id) }
                },
                {
                    $lookup: {
                        from: "membership_features",
                        localField: "membership_feature_id.membership_id",
                        foreignField: "_id",
                        as: "membership_feature_name"
                    }
                }
            ]);

            return this.sendJSONResponse(
                res,
                "display membership plan",
                {
                    length: 1
                },
                display_plan_with_id

            );
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

    async update_plan(req, res) {
        try {
            const plan_name_id = req.query._id; // Retrieve _id from query parameters
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

            const plan_namedata = {
                plan_name: req.body.plan_name,
                plan_days: req.body.plan_days,
                plan_original_price: req.body.plan_original_price,
                plan_selling_price: req.body.plan_selling_price,
                membership_feature_id: req.body.membership_feature_id,
                // membership_feature_status: req.body.membership_feature_status,
                contact_limit: req.body.contact_limit,
                sequence: req.body.sequence,
                status: req.body.status
            };
            // Ensure plan_name_id is properly retrieved and passed as parameter to findByIdAndUpdate
            const plan_name_data = await plan_schema.findByIdAndUpdate(plan_name_id, plan_namedata, { new: true });
            if (!plan_name_data) {
                return res.status(400).json({
                    success: false,
                    message: "Membership plan not found"
                });
            }
            return this.sendJSONResponse(
                res,
                "updated successfully",
                {
                    length: 1
                },
                plan_name_data
            );
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }


    async update_membership_feature_status(req, res) {
        try {

            const membership_plan_id = req.query.membership_plan_id;
            const membership_feature_id = req.query.membership_feature_id;
            const membership_feature_status = req.body.membership_feature_status;


            console.log('membership_plan_id:', membership_plan_id);
            console.log('membership_feature_id:', membership_feature_id);
            console.log('membership_feature_status:', membership_feature_status);

            const membership_plan_update_data = await plan_schema.updateOne(
                { _id: membership_plan_id, 'membership_feature_id._id': req.query.membership_feature_id },
                { $set: { 'membership_feature_id.$.membership_feature_status': req.body.membership_feature_status } }
            );
            return this.sendJSONResponse(
                res,
                "update status",
                {
                    length: 1
                },
                membership_plan_update_data

            );
            // res.send(membership_plan_update_data);

        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
            // res.send(`error ${error}`);
        }
    }


    // async update_membership_feature_status(req,res){
    //     try {
    //         const plan_name_id = req.query._id;
    //         const tokenData = req.userdata;
    //         const userData = await admin_schema.find({_id: tokenData.id});
    //         if(userData.length === 0 ){
    //          throw new Forbidden('you are not admin')
    //         }
    //        const plan_namedata = {
    //         membership_feature_id: req.body.membership_feature_id.membership_feature_status,
    //        } 
    //       const plan_name_data = await plan_schema.findByIdAndUpdate({_id:plan_name_id},plan_namedata);
    //       return this.sendJSONResponse(
    //         res,
    //         "updated successfully",
    //         {
    //             length: 1
    //         },
    //         plan_name_data
    //     );
    //     } catch (error) {
    //         if(error instanceof NotFound){
    //             throw error;
    //         }
    //         return this.sendErrorResponse(req, res, error);  
    //     }
    // }

    ////////////////////////////////////////////////////////////////////////
    async newdata(req, res) {
        try {
            // Extract data from req.body
            const { fullname, mobileno, email, city, state, packagename, price, status, transaction_id } = req.body;

            // Check if all required fields are provided
            if (!fullname || !mobileno || !email || !city || !state || !packagename || !price) {
                return res.status(400).json({
                    success: false,
                    message: 'all fields are required!',
                });
            }

            // Extract userid from the token data
            const tokenData = req.userdata;
            if (!tokenData) {
                throw new Unauthorized('unauthorized access');
            }
            const userId = tokenData.id;

            // Create a new instance of the model with the provided data
            const newData = new NewData({
                fullname,
                mobileno,
                email,
                city,
                state,
                packagename,
                price,
                status, // Include status as provided, it could be undefined if not provided
                userid: userId, // Adding userid to the new data
                transaction_id // Adding transaction_id to the new data
            });

            // Save the new data to the database
            await newData.save();

            // Sending success response with the full body data
            res.status(200).json({ success: true, message: 'data added successfully.', data: newData });
        } catch (error) {
            // Handling errors
            res.status(400).json({ success: false, error: error.message });
        }
    }


    //delete_plan

    async delete_membership_plan(req, res) {
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

            const planId = req.query.plan_id; // Extract plan ID from query parameters

            const deletedPlan = await plan_schema.findOneAndDelete({ _id: planId });

            if (!deletedPlan) {
                throw new NotFound('Membership plan not found');
            }

            return this.sendJSONResponse(
                res,
                "Membership plan deleted successfully",
                {
                    deleted_plan: deletedPlan // Include deleted plan in the response
                }
            );
        } catch (error) {
            return this.sendErrorResponse(req, res, error);
        }
    }



    /////
    async getAllData(req, res) {
        try {
            // Retrieve all data from the database
            const allData = await NewData.find();

            // Sending success response with the retrieved data
            res.status(200).json({ success: true, data: allData });
        } catch (error) {
            // Handling errors
            res.status(400).json({ success: false, error: error.message });
        }
    }




}


















