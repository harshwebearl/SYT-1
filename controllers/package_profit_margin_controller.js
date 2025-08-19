const mongoose = require("mongoose");
const packageProfitMargin = require("../models/package_profit_margin");
const userSchema = require("../models/usersSchema");




exports.create = async (req, res) => {
    try {

        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userSchema.find({ _id: tokenData.id });
        console.log(userData);
        if (userData[0].role !== "admin") {
            throw new Forbidden("you are not admin and agency");
        }


        let { state_name, month_and_margin_user, month_and_margin_agency } = req.body;

        const isValidMarginPercentage = (value) => {
            const numValue = parseFloat(value);
            return !isNaN(numValue) && numValue >= 0 && numValue <= 100;
        };

        const validateMarginArray = (array) => {
            return array.every(item => isValidMarginPercentage(item.margin_percentage));
        };

        if (!validateMarginArray(month_and_margin_user) || !validateMarginArray(month_and_margin_agency)) {
            return res.status(400).json({
                success: false,
                message: "Margin percentage must be between 0 and 100."
            });
        }

        let newData = new packageProfitMargin({
            state_name,
            month_and_margin_user,
            month_and_margin_agency
        });

        let result = await newData.save();

        res.status(200).json({
            success: true,
            message: "Package profit margin added successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.getAll = async (req, res) => {
    try {

        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userSchema.find({ _id: tokenData.id });
        console.log(userData);
        if (userData[0].role !== "admin" && userData[0].role !== "agency" && userData[0].role !== "customer") {
            throw new Forbidden("you are not admin and agency and customer");
        }


        let data = await packageProfitMargin.find();
        res.status(200).json({
            success: true,
            message: "Package profit margins retrieved successfully",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.getById = async (req, res) => {
    try {

        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userSchema.find({ _id: tokenData.id });
        console.log(userData);
        if (userData[0].role !== "admin") {
            throw new Forbidden("you are not admin and agency");
        }

        const { id } = req.params;
        let data = await packageProfitMargin.findById(id);
        res.status(200).json({
            success: true,
            message: "Package profit margins retrieved successfully",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.update = async (req, res) => {
    try {

        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userSchema.find({ _id: tokenData.id });
        console.log(userData);
        if (userData[0].role !== "admin") {
            throw new Forbidden("you are not admin and agency");
        }

        const { id } = req.params;
        let { state_name, month_and_margin_user, month_and_margin_agency } = req.body;

        let updatedData = await packageProfitMargin.findByIdAndUpdate(
            id,
            { state_name, month_and_margin_user, month_and_margin_agency },
            { new: true }
        );

        if (!updatedData) {
            return res.status(404).json({
                success: false,
                message: "Package profit margin not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Package profit margin updated successfully",
            data: updatedData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


exports.delete = async (req, res) => {
    try {

        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userSchema.find({ _id: tokenData.id });
        console.log(userData);
        if (userData[0].role !== "admin") {
            throw new Forbidden("you are not admin and agency");
        }


        const { id } = req.params;

        let deletedData = await packageProfitMargin.findByIdAndDelete(id);

        if (!deletedData) {
            return res.status(404).json({
                success: false,
                message: "Package profit margin not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Package profit margin deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};