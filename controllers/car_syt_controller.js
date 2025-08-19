const multer = require("multer");
const carModel = require("../models/car_syt.Schema");
const fs = require("fs");
const BaseController = require("./BaseController");
const NotFound = require("../errors/NotFound");
const Forbidden = require("../errors/Forbidden");
const userSchema = require("../models/usersSchema");
const mongoose = require("mongoose");
const image_url = require("../update_url_path.js");

module.exports = class CarController extends BaseController {

    async addCar(req, res) {
        try {
            const tokenData = req.userData;
            if (!tokenData) {
                return res.status(401).json({ message: "Auth fail" });
            }

            const userData = await userSchema.findById(tokenData.id);
            if (!userData || userData.role !== "admin") {
                throw new Forbidden("You are not authorized to perform this action");
            }

            const { car_name, model_number, fuel_type, car_type, car_seats } = req.body;
            const photo = req.files.photo[0].filename;

            const car = new carModel({ car_name, model_number, fuel_type, car_type, car_seats, photo });
            await car.save();

            return this.sendJSONResponse(res, "Car added successfully!", {}, car);
        } catch (error) {
            return this.sendErrorResponse(req, res, error);
        }
    }

    async getAllCars(req, res) {
        try {
            const tokenData = req.userData;
            if (tokenData === "") {
                return res.status(401).json({ message: "Auth fail" });
            }

            const userData = await userSchema.findById(tokenData.id);

            if (!["admin", "agency", "customer"].includes(userData.role)) {
                throw new Forbidden("You are not authorized to access this resource");
            }

            const cars = await carModel.find();
            for (let car of cars) {
                car.photo = await image_url("car_syt", car.photo);
            }

            return this.sendJSONResponse(res, "Cars fetched successfully!", { length: cars.length }, cars);
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

    async editCar(req, res) {
        try {
            const id = req.query.id;
            const tokenData = req.userData;

            if (!tokenData) {
                return res.status(401).json({ message: "Auth fail" });
            }

            const userData = await userSchema.findById(tokenData.id);
            if (!userData || userData.role !== "admin") {
                throw new Forbidden("You are not authorized to perform this action");
            }

            const car = await carModel.findById(id);
            if (!car) {
                throw new NotFound("Car not found");
            }

            const data = {
                car_name: req.body.car_name,
                model_number: req.body.model_number,
                fuel_type: req.body.fuel_type,
                car_type: req.body.car_type,
                car_seats: req.body.car_seats
            };

            if (req.files && req.files.photo) {
                data.photo = req.files.photo[0].filename;
            }

            const updatedCar = await carModel.findByIdAndUpdate(id, data, { new: true });
            return this.sendJSONResponse(res, "Car updated successfully!", {}, updatedCar);
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }

    async deleteCar(req, res) {
        try {
            const id = req.query.id;
            const tokenData = req.userData;

            if (!tokenData) {
                return res.status(401).json({ message: "Auth fail" });
            }

            const userData = await userSchema.findById(tokenData.id);
            if (!userData || userData.role !== "admin") {
                throw new Forbidden("You are not authorized to perform this action");
            }

            const car = await carModel.findById(id);
            if (!car) {
                throw new NotFound("Car not found");
            }

            await carModel.deleteOne({ _id: id });
            return this.sendJSONResponse(res, "Car deleted successfully!", {}, {});
        } catch (error) {
            if (error instanceof NotFound) {
                throw error;
            }
            return this.sendErrorResponse(req, res, error);
        }
    }
};
