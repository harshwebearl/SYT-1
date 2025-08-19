const mongoose = require("mongoose");
const CarBooking = require("../models/car_booking_syt");
const userSchema = require("../models/usersSchema");
const VendorCar = require("../models/vendor_car_schema");
const NotFound = require("../errors/NotFound");
const Forbidden = require("../errors/Forbidden");
const BaseController = require("./BaseController");
const image_url = require("../update_url_path.js");





module.exports = class car_booking_syt_Controller extends BaseController {


    async newCarBooking(req, res) {
        try {
            const tokenData = req.userData;
            if (tokenData === "") {
                return res.status(401).json({
                    message: "Auth fail"
                });
            }
            const userData = await userSchema.find({ _id: tokenData.id });
            console.log(userData[0].role)
            if (userData[0].role !== "customer") {
                throw new Forbidden("you are not customer");
            }

            let bookingData = new CarBooking({
                vendor_car_id: req.body.vendor_car_id,
                user_id: tokenData.id,
                pickup_address: req.body.pickup_address,
                drop_address: req.body.drop_address,
                one_way_two_way: req.body.one_way_two_way,
                pickup_date: req.body.pickup_date,
                pickup_time: req.body.pickup_time,
                name: req.body.name,
                email: req.body.email,
                mobile_number: req.body.mobile_number,
                gender: req.body.gender,
                return_date: req.body.return_date,
                price_type: req.body.price_type,
                car_condition: req.body.car_condition,
                model_year: req.body.model_year,
                insurance: req.body.insurance,
                registration_number: req.body.registration_number,
                color: req.body.color,
                price_per_km: req.body.price_per_km,
                price_per_day: req.body.price_per_day,
                pincode: req.body.pincode,
                city: req.body.city,
                state: req.body.state,
                outStateAllowed: req.body.outStateAllowed,
                AC: req.body.AC
            });

            let result = await bookingData.save();

            res.status(200).json({
                success: true,
                message: "Car Booking Successfully",
                data: result
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error"
            })
        }
    }


    // async displayUserBookedCar(req, res) {
    //     try {
    //         const tokenData = req.userData;
    //         if (tokenData === "") {
    //             return res.status(401).json({
    //                 message: "Auth fail"
    //             });
    //         }
    //         const userData = await userSchema.find({ _id: tokenData.id });
    //         if (userData[0].role !== "customer") {
    //             throw new Forbidden("you are not customer");
    //         }

    //         let carBookedDetails = await CarBooking.aggregate([
    //             {
    //                 $match: {
    //                     user_id: mongoose.Types.ObjectId(tokenData.id)
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: 'vendorcars',
    //                     localField: 'vendor_car_id',
    //                     foreignField: '_id',
    //                     as: 'vendor_car_details',
    //                     pipeline: [
    //                         {
    //                             $lookup: {
    //                                 from: 'cars',
    //                                 localField: 'car_id',
    //                                 foreignField: '_id',
    //                                 as: "car_details"
    //                             }
    //                         }
    //                     ]
    //                 }
    //             },
    //             {
    //                 $addFields: { booktype: 'car' }
    //             }
    //         ]);

    //         if (carBookedDetails.length === 0) {
    //             return res.status(200).json({
    //                 success: true,
    //                 message: "User Not A Bokked Car"
    //             })
    //         }

    //         res.status(200).json({
    //             success: true,
    //             message: "User Booked Car Display Successfully",
    //             data: carBookedDetails
    //         })
    //     } catch (error) {
    //         console.log(error);
    //         res.status(500).json({
    //             success: false,
    //             message: "Internal Server Error"
    //         })
    //     }
    // }


    async displayUserBookedCar(req, res) {
        try {
            const tokenData = req.userData;
            if (!tokenData) {
                return res.status(401).json({
                    message: "Auth fail"
                });
            }

            const userData = await userSchema.findOne({ _id: tokenData.id });
            if (!userData || userData.role !== "customer") {
                throw new Forbidden("You are not a customer");
            }

            let carBookedDetails = await CarBooking.aggregate([
                {
                    $match: {
                        user_id: new mongoose.Types.ObjectId(tokenData.id),
                        status: "booked"
                    }
                },
                {
                    $lookup: {
                        from: "vendorcars",
                        localField: "vendor_car_id",
                        foreignField: "_id",
                        as: "vendor_car_details"
                    }
                },
                { $unwind: "$vendor_car_details" }, // Unwind vendor car details
                {
                    $lookup: {
                        from: "agencypersonals",
                        localField: "vendor_car_details.vendor_id",
                        foreignField: "user_id",
                        as: "agency_details",
                        pipeline: [
                            {
                                $project: {
                                    password: 0
                                }
                            }
                        ]
                    }
                },
                { $unwind: "$agency_details" }, // Unwind vendor car details
                {
                    $lookup: {
                        from: "cars",
                        localField: "vendor_car_details.car_id",
                        foreignField: "_id",
                        as: "vendor_car_details.car_details"
                    }
                },
                { $unwind: "$vendor_car_details.car_details" }, // Unwind car details
                {
                    $addFields: { booktype: "car" }
                }
            ]);

            if (carBookedDetails.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "User has not booked a car",
                    data: []
                });
            }

            // Process each booking to update image URLs
            for (let i = 0; i < carBookedDetails.length; i++) {
                let vendorCar = carBookedDetails[i].vendor_car_details;

                // Convert vendor car photos to full image URLs
                if (vendorCar.photos && vendorCar.photos.length > 0) {
                    for (let j = 0; j < vendorCar.photos.length; j++) {
                        vendorCar.photos[j] = await image_url("vendor_car", vendorCar.photos[j]);
                    }
                }

                // Convert car_details photo to full image URL and add to photos array
                if (vendorCar.car_details.photo) {
                    vendorCar.car_details.photo = await image_url("car_syt", vendorCar.car_details.photo);
                    // vendorCar.photos.push(carPhotoUrl); // Add car photo URL to photos array
                }
            }

            res.status(200).json({
                success: true,
                message: "User Booked Car Displayed Successfully",
                data: carBookedDetails
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }


    async displayUserBookedCarDetails(req, res) {
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

            let { car_booking_id } = req.query

            let carBookedDetails = await CarBooking.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(car_booking_id)
                    }
                },
                {
                    $lookup: {
                        from: "vendorcars",
                        localField: "vendor_car_id",
                        foreignField: "_id",
                        as: "vendor_car_details"
                    }
                },
                { $unwind: "$vendor_car_details" }, // Unwind vendor car details
                {
                    $lookup: {
                        from: "cars",
                        localField: "vendor_car_details.car_id",
                        foreignField: "_id",
                        as: "vendor_car_details.car_details"
                    }
                },
                { $unwind: "$vendor_car_details.car_details" },
                {
                    $lookup: {
                        from: "agencypersonals",
                        localField: "vendor_car_details.vendor_id",
                        foreignField: "user_id",
                        as: "agency_details",
                        pipeline: [
                            {
                                $project: {
                                    password: 0
                                }
                            }
                        ]
                    }
                },
                { $unwind: "$agency_details" },
                {
                    $addFields: { booktype: "car" }
                }
            ]);

            if (carBookedDetails.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "User Not A Bokked Car"
                })
            }

            for (let i = 0; i < carBookedDetails.length; i++) {
                let vendorCar = carBookedDetails[i].vendor_car_details;

                // Convert vendor car photos to full image URLs
                if (vendorCar.photos && vendorCar.photos.length > 0) {
                    for (let j = 0; j < vendorCar.photos.length; j++) {
                        vendorCar.photos[j] = await image_url("vendor_car", vendorCar.photos[j]);
                    }
                }

                // Convert car_details photo to full image URL and add to photos array
                if (vendorCar.car_details.photo) {
                    vendorCar.car_details.photo = await image_url("car_syt", vendorCar.car_details.photo);
                    // vendorCar.photos.push(carPhotoUrl); // Add car photo URL to photos array
                }
            }

            res.status(200).json({
                success: true,
                message: "User Booked Car Display Successfully",
                data: carBookedDetails
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error"
            })
        }
    }

    async displayVendorBookedCar(req, res) {
        try {
            const tokenData = req.userData;
            console.log(tokenData)
            console.log('tokenData')
            if (tokenData === "") {
                return res.status(401).json({
                    message: "Auth fail"
                });
            }
            const userData = await userSchema.findById(tokenData.id);
            if (userData.role !== "agency") {
                throw new Forbidden("You are not agency");
            }

            const displayVendorBookedCar = await CarBooking.aggregate([
                {
                    $match: {
                        status: "booked"
                    }
                },
                {
                    $lookup: {
                        from: 'vendorcars', // The name of the VendorCar collection
                        localField: 'vendor_car_id',
                        foreignField: '_id',
                        as: 'vendor_car_details',
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'cars',
                                    localField: 'car_id',
                                    foreignField: '_id',
                                    as: "car_details"
                                }
                            }
                        ]
                    }
                },
                {
                    $match: {
                        'vendor_car_details.vendor_id': new mongoose.Types.ObjectId(tokenData.id)
                    }
                },
                {
                    $lookup: {
                        from: 'customers', // The name of the User collection
                        localField: 'user_id',
                        foreignField: 'user_id',
                        as: 'customer_details'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        vendor_car_id: 1,
                        user_id: 1,
                        pickup_address: 1,
                        drop_address: 1,
                        one_way_two_way: 1,
                        total_days: 1,
                        amount: 1,
                        pickup_date: 1,
                        pickup_time: 1,
                        name: 1,
                        email: 1,
                        mobile_number: 1,
                        gender: 1,
                        return_date: 1,
                        return_time: 1,
                        status: 1,
                        car_condition: 1,
                        model_year: 1,
                        insurance: 1,
                        registration_number: 1,
                        color: 1,
                        price_type: 1,
                        price_per_km: 1,
                        price_per_day: 1,
                        pincode: 1,
                        city: 1,
                        state: 1,
                        outStateAllowed: 1,
                        AC: 1,
                        vendor_car_details: 1,
                        customer_details: 1,
                        transaction_id: 1,
                        pickup_state: 1,
                        pickup_city: 1,
                        drop_city: 1,
                        drop_state: 1,
                        payment: 1,
                    }
                }
            ]);

            for (let i = 0; i < displayVendorBookedCar.length; i++) {
                let vendorCars = displayVendorBookedCar[i].vendor_car_details;
                let customerPhoto = displayVendorBookedCar[i].customer_details[0].photo;

                for (let j = 0; j < vendorCars.length; j++) {
                    let vendorCar = vendorCars[j];

                    // Convert vendor car photos to full image URLs using Promise.all()
                    if (vendorCar.photos && vendorCar.photos.length > 0) {
                        vendorCar.photos = await Promise.all(
                            vendorCar.photos.map(photo => image_url("vendor_car", photo))
                        );
                    }

                    // Convert car_details photos to full image URLs
                    if (vendorCar.car_details && vendorCar.car_details.length > 0) {
                        for (let k = 0; k < vendorCar.car_details.length; k++) {
                            let carDetail = vendorCar.car_details[k];

                            if (carDetail.photo) {
                                carDetail.photo = await image_url("car_syt", carDetail.photo);
                            }
                        }
                    }
                }

                for (let j = 0; j < displayVendorBookedCar[i].customer_details.length; j++) {
                    let customer = displayVendorBookedCar[i].customer_details[j];
                    if (customerPhoto) {
                        customer.photo = await image_url("users", customerPhoto);
                    }
                }
            }


            res.status(200).json({
                success: true,
                message: 'Display Vendor All Booked Car',
                data: displayVendorBookedCar
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async displayVendorBookedCarById(req, res) {
        try {
            const tokenData = req.userData;
            if (!tokenData) {
                return res.status(401).json({
                    message: "Auth fail"
                });
            }
            const userData = await userSchema.findById(tokenData.id);
            if (userData.role !== "agency" && userData.role !== "admin") {
                throw new Forbidden("You are not agency or admin");
            }

            let { booked_car_id } = req.query

            const displayVendorBookedCar = await CarBooking.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(booked_car_id)
                    }
                },
                {
                    $lookup: {
                        from: 'vendorcars', // The name of the VendorCar collection
                        localField: 'vendor_car_id',
                        foreignField: '_id',
                        as: 'vendor_car_details',
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'cars',
                                    localField: 'car_id',
                                    foreignField: '_id',
                                    as: "car_details"
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'customers', // The name of the User collection
                        localField: 'user_id',
                        foreignField: 'user_id',
                        as: 'customer_details'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        vendor_car_id: 1,
                        user_id: 1,
                        pickup_address: 1,
                        drop_address: 1,
                        one_way_two_way: 1,
                        pickup_date: 1,
                        total_days: 1,
                        amount: 1,
                        pickup_time: 1,
                        name: 1,
                        email: 1,
                        mobile_number: 1,
                        gender: 1,
                        return_date: 1,
                        return_time: 1,
                        status: 1,
                        car_condition: 1,
                        model_year: 1,
                        insurance: 1,
                        registration_number: 1,
                        color: 1,
                        price_type: 1,
                        price_per_km: 1,
                        price_per_day: 1,
                        pincode: 1,
                        city: 1,
                        state: 1,
                        outStateAllowed: 1,
                        AC: 1,
                        vendor_car_details: 1,
                        customer_details: 1,
                          transaction_id: 1,
                        pickup_state: 1,
                        pickup_city: 1,
                        drop_city :1,
                        drop_state: 1,
                        payment: 1,
                    }
                }
            ]);

            for (let i = 0; i < displayVendorBookedCar.length; i++) {
                let vendorCars = displayVendorBookedCar[i].vendor_car_details;
                let customerPhoto = displayVendorBookedCar[i].customer_details[0].photo;

                for (let j = 0; j < vendorCars.length; j++) {
                    let vendorCar = vendorCars[j];

                    // Convert vendor car photos to full image URLs using Promise.all()
                    if (vendorCar.photos && vendorCar.photos.length > 0) {
                        vendorCar.photos = await Promise.all(
                            vendorCar.photos.map(photo => image_url("vendor_car", photo))
                        );
                    }

                    // Convert car_details photos to full image URLs
                    if (vendorCar.car_details && vendorCar.car_details.length > 0) {
                        for (let k = 0; k < vendorCar.car_details.length; k++) {
                            let carDetail = vendorCar.car_details[k];

                            if (carDetail.photo) {
                                carDetail.photo = await image_url("car_syt", carDetail.photo);
                            }
                        }
                    }
                }

                for (let j = 0; j < displayVendorBookedCar[i].customer_details.length; j++) {
                    let customer = displayVendorBookedCar[i].customer_details[j];
                    if (customerPhoto) {
                        customer.photo = await image_url("users", customerPhoto);
                    }
                }
            }

            res.status(200).json({
                success: true,
                message: 'Display Vendor details Booked Car',
                data: displayVendorBookedCar
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async update_car_booking(req, res) {
        try {
            const tokenData = req.userData;

            if (!tokenData) {
                return res.status(401).json({
                    message: "Auth fail"
                });
            }

            const userData = await userSchema.findById(tokenData.id);
            if (!userData || userData.role !== "agency") {
                return res.status(403).json({
                    message: "Forbidden: you are not agency"
                });
            }

            const { _id } = req.query;
            if (!_id) {
                return res.status(400).json({
                    message: "Bad Request: Missing car booking ID"
                });
            }

            const Data = {
                status: req.body.status,
            };

            const update_car_booking = await CarBooking.findOneAndUpdate(
                { id: id, agency_id: tokenData.id },
                Data,
                { new: true } // This option returns the updated document
            );

            if (!update_car_booking) {
                throw new NotFound("Car booking not found");
            }

            return res.status(200).json({
                success: true,
                message: "update car_booking",
                data: update_car_booking
            });
        } catch (error) {
            if (error instanceof NotFound) {
                console.error(error);
                return res.status(404).json({
                    message: error.message
                });
            }
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    };

    async displayVendorBookedCarByAdmin(req, res) {
        try {
            const tokenData = req.userData;
            if (!tokenData) {
                return res.status(401).json({
                    message: "Auth fail"
                });
            }
            const userData = await userSchema.findById(tokenData.id);
            if (userData.role !== "admin") {
                throw new Forbidden("You are not admin");
            }

            // const { _id } = req.query;
            // if (!_id) {
            //     return res.status(400).json({
            //         message: "Bad Request: Missing vendor ID"
            //     });
            // }

            const displayVendorBookedCar = await CarBooking.aggregate([
                {
                    $match: {
                        status: "booked"
                    }
                },
                {
                    $lookup: {
                        from: 'vendorcars', // The name of the VendorCar collection
                        localField: 'vendor_car_id',
                        foreignField: '_id',
                        as: 'vendor_car_details',
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'cars',
                                    localField: 'car_id',
                                    foreignField: '_id',
                                    as: "car_details"
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "agencypersonals",
                        localField: "vendor_car_details.vendor_id",
                        foreignField: "user_id",
                        as: "agency_details",
                        pipeline: [
                            {
                                $project: {
                                    password: 0
                                }
                            }
                        ]
                    }
                },
                // {
                //     $match: {
                //         'vendor_car_details.vendor_id': mongoose.Types.ObjectId(_id)
                //     }
                // },
                {
                    $lookup: {
                        from: 'customers', // The name of the User collection
                        localField: 'user_id',
                        foreignField: 'user_id',
                        as: 'customer_details'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        vendor_car_id: 1,
                        user_id: 1,
                        pickup_address: 1,
                        total_days: 1,
                        amount: 1,
                        drop_address: 1,
                        one_way_two_way: 1,
                        pickup_date: 1,
                        pickup_time: 1,
                        name: 1,
                        email: 1,
                        return_time: 1,
                        mobile_number: 1,
                        gender: 1,
                        return_date: 1,
                        status: 1,
                        car_condition: 1,
                        model_year: 1,
                        insurance: 1,
                        registration_number: 1,
                        color: 1,
                        price_type: 1,
                        price_per_km: 1,
                        price_per_day: 1,
                        pincode: 1,
                        city: 1,
                        state: 1,
                        outStateAllowed: 1,
                        AC: 1,
                        vendor_car_details: 1,
                        customer_details: 1,
                        agency_details: 1,
                          transaction_id: 1,
                        pickup_state: 1,
                        pickup_city: 1,
                        drop_city: 1,
                        drop_state: 1,
                        payment: 1,
                    }
                }
            ]);

            for (let i = 0; i < displayVendorBookedCar.length; i++) {
                let vendorCars = displayVendorBookedCar[i].vendor_car_details;
                let customerPhoto = displayVendorBookedCar[i].customer_details[0].photo;
                let agencyPhoto = displayVendorBookedCar[i].agency_details[0].agency_logo;

                for (let j = 0; j < vendorCars.length; j++) {
                    let vendorCar = vendorCars[j];

                    // Convert vendor car photos to full image URLs using Promise.all()
                    if (vendorCar.photos && vendorCar.photos.length > 0) {
                        vendorCar.photos = await Promise.all(
                            vendorCar.photos.map(photo => image_url("vendor_car", photo))
                        );
                    }

                    // Convert car_details photos to full image URLs
                    if (vendorCar.car_details && vendorCar.car_details.length > 0) {
                        for (let k = 0; k < vendorCar.car_details.length; k++) {
                            let carDetail = vendorCar.car_details[k];

                            if (carDetail.photo) {
                                carDetail.photo = await image_url("car_syt", carDetail.photo);
                            }
                        }
                    }
                }

                for (let j = 0; j < displayVendorBookedCar[i].customer_details.length; j++) {
                    let customer = displayVendorBookedCar[i].customer_details[j];
                    if (customerPhoto) {
                        customer.photo = await image_url("users", customerPhoto);
                    }
                }

                for (let j = 0; j < displayVendorBookedCar[i].agency_details.length; j++) {
                    let agency = displayVendorBookedCar[i].agency_details[j];
                    if (agencyPhoto) {
                        agency.agency_logo = await image_url("agency", agencyPhoto);
                    }
                }
            }

            res.status(200).json({
                success: true,
                message: 'Display Vendor All Booked Car',
                data: displayVendorBookedCar
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async displayUserBookedCarByAdmin(req, res) {
        try {
            const tokenData = req.userData;
            if (tokenData === "") {
                return res.status(401).json({
                    message: "Auth fail"
                });
            }
            const userData = await userSchema.find({ _id: tokenData.id });
            if (userData[0].role !== "admin") {
                throw new Forbidden("you are not customer");
            }

            const { _id } = req.query;
            if (!_id) {
                return res.status(400).json({
                    message: "Bad Request: Missing vendor ID"
                });
            }


            let carBookedDetails = await CarBooking.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(_id)
                    }
                },
                {
                    $lookup: {
                        from: 'vendorcars',
                        localField: 'vendor_car_id',
                        foreignField: '_id',
                        as: 'vendor_car_details',
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'cars',
                                    localField: 'car_id',
                                    foreignField: '_id',
                                    as: "car_details"
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "agencypersonals",
                        localField: "vendor_car_details.vendor_id",
                        foreignField: "user_id",
                        as: "agency_details",
                        pipeline: [
                            {
                                $project: {
                                    password: 0
                                }
                            }
                        ]
                    }
                },
                // {
                //     $match: {
                //         'vendor_car_details.vendor_id': mongoose.Types.ObjectId(_id)
                //     }
                // },
                {
                    $lookup: {
                        from: 'customers', // The name of the User collection
                        localField: 'user_id',
                        foreignField: 'user_id',
                        as: 'customer_details'
                    }
                },
                {
                    $addFields: { booktype: 'car' }
                }
            ]);

            if (carBookedDetails.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "User Not A Bokked Car"
                })
            }

            for (let i = 0; i < carBookedDetails.length; i++) {
                let vendorCars = carBookedDetails[i].vendor_car_details;
                let customerPhoto = carBookedDetails[i].customer_details[0].photo;
                let agencyPhoto = carBookedDetails[i].agency_details[0].agency_logo;

                for (let j = 0; j < vendorCars.length; j++) {
                    let vendorCar = vendorCars[j];

                    // Convert vendor car photos to full image URLs using Promise.all()
                    if (vendorCar.photos && vendorCar.photos.length > 0) {
                        vendorCar.photos = await Promise.all(
                            vendorCar.photos.map(photo => image_url("vendor_car", photo))
                        );
                    }

                    // Convert car_details photos to full image URLs
                    if (vendorCar.car_details && vendorCar.car_details.length > 0) {
                        for (let k = 0; k < vendorCar.car_details.length; k++) {
                            let carDetail = vendorCar.car_details[k];

                            if (carDetail.photo) {
                                carDetail.photo = await image_url("car_syt", carDetail.photo);
                            }
                        }
                    }
                }

                for (let j = 0; j < carBookedDetails[i].customer_details.length; j++) {
                    let customer = carBookedDetails[i].customer_details[j];
                    if (customerPhoto) {
                        customer.photo = await image_url("users", customerPhoto);
                    }
                }

                for (let j = 0; j < carBookedDetails[i].agency_details.length; j++) {
                    let agency = carBookedDetails[i].agency_details[j];
                    if (agencyPhoto) {
                        agency.agency_logo = await image_url("agency", agencyPhoto);
                    }
                }
            }


            res.status(200).json({
                success: true,
                message: "User Booked Car Display Successfully",
                data: carBookedDetails
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error"
            })
        }
    }

}
