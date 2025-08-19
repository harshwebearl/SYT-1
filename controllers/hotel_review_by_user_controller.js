const mongoose = require("mongoose");
const hotel_review_schema = require("../models/hotel_review_schema");
const BaseController = require("./BaseController");
const Forbidden = require("../errors/Forbidden");
const NotFound = require("../errors/NotFound");
const userSchema = require("../models/usersSchema");




module.exports = class hotel_review_Controller extends BaseController {


    async add_hotel_review(req, res) {
        try {
            const tokenData = req.userData;
            if (tokenData === "") {
                return res.status(401).json({
                    message: "Auth fail"
                });
            }
            const userData = await userSchema.find({ _id: tokenData.id });
            if (userData[0].role !== "customer") {
                throw new Forbidden("you are not customer");
            }

            const data = {
                user_id: tokenData.id,
                star: req.body.star,
                book_hotel_id: req.body.book_hotel_id,
                comment_box: req.body.comment_box
            };

            const userReview = await hotel_review_schema.find({
                user_id: tokenData.id,
                book_hotel_id: req.body.book_hotel_id
            });
            if (userReview.length !== 0) {
                // console.log(userReview);
                throw new Forbidden("You have already one review on this hotel");
            }

            const Addreview = new hotel_review_schema(data);
            const insertreview = await Addreview.save();
            return this.sendJSONResponse(
                res,
                "hotel review added successfully",
                {
                    length: 1
                },
                insertreview
            );
        } catch (error) {
            if (error instanceof NotFound) {
                console.log(error); // throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }


    // async Display_review(req, res) {
    //     try {

    //         let book_hotel_id = req.query.book_hotel_id
    //         console.log(book_hotel_id);

    //         const tokenData = req.userData;
    //         if (tokenData === "") {
    //             return res.status(401).json({
    //                 message: "Auth fail"
    //             });
    //         }
    //         const userData = await userSchema.find({ _id: tokenData.id });
    //         console.log(userData);
    //         if (userData[0].role !== "customer") {
    //             throw new Forbidden("you are not customer");
    //         }

    //         let reviewDisplay = await hotel_review_schema.aggregate([
    //             {
    //                 $match: {
    //                     book_hotel_id: new mongoose.Types.ObjectId(book_hotel_id),
    //                     user_id: new mongoose.Types.ObjectId(tokenData.id)
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: 'hotel_booking_syts',
    //                     localField: 'book_hotel_id',
    //                     foreignField: '_id',
    //                     as: 'book_hotel_details'
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     _id: 1,
    //                     user_id: 1,
    //                     star: 1,
    //                     book_hotel_id: 1,
    //                     comment_box: 1,
    //                     book_hotel_details: 1,
    //                 }
    //             }
    //         ]);

    //         res.status(200).json({
    //             success: true,
    //             message: "review display successfully",
    //             data: reviewDisplay
    //         })
    //     } catch (error) {
    //         if (error instanceof NotFound) {
    //             console.log(error); // throw error;
    //         }
    //         return this.sendErrorResponse(req, res, error);
    //     }
    // }


    async Display_review(req, res) {
        try {


            const tokenData = req.userData;
            if (!tokenData) {
                return res.status(401).json({
                    message: "Auth fail"
                });
            }
            const userData = await userSchema.findById(tokenData.id);
            console.log(userData);
            if (userData.role !== "customer" && userData.role !== "agency") {
                throw new Forbidden("you are not customer");
            }

            let book_hotel_id = req.query.book_hotel_id

            console.log(book_hotel_id)
            console.log(tokenData.id)

            let reviewDisplay = await hotel_review_schema.aggregate([
                {
                    $match: {
                        book_hotel_id: new mongoose.Types.ObjectId(book_hotel_id),
                        user_id: new mongoose.Types.ObjectId(tokenData.id)
                    }
                },
                {
                    $lookup: {
                        from: 'hotel_syts',
                        localField: 'book_hotel_id',
                        foreignField: '_id',
                        as: 'hotel_details'
                    }
                },
                {
                    $unwind: '$hotel_details'
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user_details'
                    }
                },
                {
                    $unwind: '$user_details'
                },
                {
                    $lookup: {
                        from: 'customers',
                        localField: 'user_details._id',
                        foreignField: 'user_id',
                        as: 'customer_details'
                    }
                },
                {
                    $unwind: {
                        path: "$customer_details",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        "user_details.customer_details": "$customer_details"
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        user_id: { $first: "$user_id" },
                        star: { $first: "$star" },
                        book_hotel_id: { $first: "$book_hotel_id" },
                        comment_box: { $first: "$comment_box" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                        __v: { $first: "$__v" },
                        user_details: { $first: "$user_details" },
                        hotel_details: { $first: "$hotel_details" },
                        // book_hotel_details: { $first: "$book_hotel_details" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        user_id: 1,
                        star: 1,
                        book_hotel_id: 1,
                        comment_box: 1,
                        'hotel_details._id': 1,
                        'hotel_details.hotel_name': 1,
                        'hotel_details.hotel_address': 1,
                        'hotel_details.hotel_description': 1,
                        'hotel_details.hotel_address': 1,
                        'hotel_details.hotel_highlights': 1,
                        'hotel_details.hotel_photo': 1,
                        'hotel_details.hotel_type': 1,
                        'hotel_details.city': 1,
                        'hotel_details.state': 1,
                        'hotel_details.other': 1,
                        'hotel_details.status': 1,
                        'user_details._id': 1,
                        'user_details.phone': 1,
                        'user_details.customer_details.name': 1,
                        'user_details.customer_details.email_address': 1,
                        'user_details.customer_details.gender': 1,
                        'user_details.customer_details.state': 1,
                        'user_details.customer_details.city': 1,
                        'user_details.customer_details.photo': 1,
                    }
                }
            ]);

            res.status(200).json({
                success: true,
                message: "Review displayed successfully",
                data: reviewDisplay
            });
        } catch (error) {
            if (error instanceof NotFound) {
                console.log(error); // throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }



    async updatereview(req, res) {
        try {
            const review_id = req.query.review_id;
            const tokenData = req.userData;
            if (tokenData === "") {
                return res.status(401).json({
                    message: "Auth fail"
                });
            }
            const userData = await userSchema.find({ _id: tokenData.id });
            if (userData[0].role !== "customer") {
                throw new Forbidden("you are not customer");
            }

            const data = {
                star: req.body.star,
                book_hotel_id: req.body.book_hotel_id,
                comment_box: req.body.comment_box
            };

            const updatereview = await hotel_review_schema.findByIdAndUpdate(review_id, data, { new: true });
            return this.sendJSONResponse(
                res,
                "review updated",
                {
                    length: 1
                },
                updatereview
            );
        } catch (error) {
            if (error instanceof NotFound) {
                console.log(error); // throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

    async delete_hotel_review(req, res) {

        const review_id = req.query._id;
        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userSchema.find({ _id: tokenData.id });
        if (userData[0].role !== "customer") {
            throw new Forbidden("you are not customer");
        }

        let deletedHotelReview = await hotel_review_schema.findByIdAndDelete(review_id)

        if (!deletedHotelReview) {
            return res.status(400).json({
                success: false,
                message: "Hotel Review Not found!"
            })
        }

        res.status(200).json({
            success: true,
            message: "Hotel Review Delete Successfully",
            data: deletedHotelReview
        })
    }

    async Display_review_by_admin_and_agency(req, res) {
        try {

            let book_hotel_id = req.query.book_hotel_id
            console.log(book_hotel_id);

            const tokenData = req.userData;
            if (tokenData === "") {
                return res.status(401).json({
                    message: "Auth fail"
                });
            }
            const userData = await userSchema.find({ _id: tokenData.id });
            console.log(userData);
            if (userData[0].role !== "admin" && userData[0].role !== "agency") {
                throw new Forbidden("you are not customer");
            }

            let reviewDisplay = await hotel_review_schema.aggregate([
                {
                    $match: {
                        book_hotel_id: new mongoose.Types.ObjectId(book_hotel_id),
                    }
                },
                {
                    $lookup: {
                        from: 'hotel_syts',
                        localField: 'book_hotel_id',
                        foreignField: '_id',
                        as: 'hotel_details'
                    }
                },
                {
                    $unwind: '$hotel_details'
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user_details'
                    }
                },
                {
                    $unwind: '$user_details'
                },
                {
                    $lookup: {
                        from: 'customers',
                        localField: 'user_details._id',
                        foreignField: 'user_id',
                        as: 'customer_details'
                    }
                },
                {
                    $unwind: {
                        path: "$customer_details",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        "user_details.customer_details": "$customer_details"
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        user_id: { $first: "$user_id" },
                        star: { $first: "$star" },
                        book_hotel_id: { $first: "$book_hotel_id" },
                        comment_box: { $first: "$comment_box" },
                        createdAt: { $first: "$createdAt" },
                        updatedAt: { $first: "$updatedAt" },
                        __v: { $first: "$__v" },
                        user_details: { $first: "$user_details" },
                        hotel_details: { $first: "$hotel_details" },
                        book_hotel_details: { $first: "$book_hotel_details" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        user_id: 1,
                        star: 1,
                        book_hotel_id: 1,
                        comment_box: 1,
                        'hotel_details._id': 1,
                        'hotel_details.hotel_name': 1,
                        'hotel_details.hotel_address': 1,
                        'hotel_details.hotel_description': 1,
                        'hotel_details.hotel_address': 1,
                        'hotel_details.hotel_highlights': 1,
                        'hotel_details.hotel_photo': 1,
                        'hotel_details.hotel_type': 1,
                        'hotel_details.city': 1,
                        'hotel_details.state': 1,
                        'hotel_details.other': 1,
                        'hotel_details.status': 1,
                        'user_details._id': 1,
                        'user_details.phone': 1,
                        'user_details.customer_details.name': 1,
                        'user_details.customer_details.email_address': 1,
                        'user_details.customer_details.gender': 1,
                        'user_details.customer_details.state': 1,
                        'user_details.customer_details.city': 1,
                        'user_details.customer_details.photo': 1,
                    }
                }
            ]);

            res.status(200).json({
                success: true,
                message: "review display successfully",
                data: reviewDisplay
            })
        } catch (error) {
            if (error instanceof NotFound) {
                console.log(error); // throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

}
