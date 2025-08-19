const mongoose = require("mongoose");
const room_price = require("../models/room_price");
const userSchema = require("../models/usersSchema");




exports.addRoomPrice = async (req, res) => {
    try {
        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userSchema.find({ _id: tokenData.id });

        if (userData[0].role !== "agency") {
            throw new Forbidden("you are not admin or agency or customer");
        }

        let { price_and_date, hotel_id, room_id, othere_future_agency } = req.body

        let addRoom = new room_price({
            agency_id: tokenData.id,
            price_and_date,
            hotel_id,
            room_id,
            othere_future_agency
        });

        let result = await addRoom.save();

        return res.status(200).json({
            success: true,
            message: "Room Price Added Successfully",
            data: result
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

exports.updateRoomPrice = async (req, res) => {
    try {
        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }

        const userData = await userSchema.findById(tokenData.id);
        if (!userData || userData.role !== "agency") {
            throw new Forbidden("you are not admin or agency or customer");
        }

        // Extracting data from the request body
        const { price_and_date, othere_future_agency } = req.body;
        const { roomPriceId } = req.query; // Expecting room price ID from URL parameters

        // Find and update the room price
        const updatedRoomPrice = await room_price.findByIdAndUpdate(
            roomPriceId,
            {
                price_and_date,
                othere_future_agency
            },
            { new: true } // Return the updated document and run validators
        );

        if (!updatedRoomPrice) {
            return res.status(404).json({
                success: false,
                message: "Room price not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Room Price Updated Successfully",
            data: updatedRoomPrice
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}
