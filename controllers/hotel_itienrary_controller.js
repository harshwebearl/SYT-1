const mongoose = require("mongoose");
const Hotel_itienrary = require("../models/hotel_itienrary");
const userSchema = require("../models/usersSchema");
const image_url = require("../update_url_path.js");
const fn = "hotel_itienrary";

exports.hotel_itienrary_create = async (req, res) => {
  try {
    const tokenData = req.userData;
    if (tokenData === "") {
      return res.status(401).json({
        message: "Auth fail"
      });
    }
    const userData = await userSchema.find({ _id: tokenData.id });

    if (userData[0].role !== "agency" && userData[0].role !== "admin") {
      throw new Forbidden("you are not agency or admin");
    }

    let {
      hotel_name,
      hotel_address,
      hotel_photo,
      hotel_type,
      hotel_city,
      hotel_state,
      hotel_description,
      other,
      breakfast_price,
      lunch_price,
      dinner_price,
      rooms,
      breakfast,
      lunch,
      dinner
    } = req.body;

    // Validate rooms array for duplicate room_type
    if (rooms && Array.isArray(rooms)) {
      const roomTypes = rooms.map((room) => room.room_type);
      const uniqueRoomTypes = new Set(roomTypes);
      if (uniqueRoomTypes.size !== roomTypes.length) {
        return res.status(400).json({
          success: false,
          message: "Duplicate room type values are not allowed in rooms."
        });
      }
    }

    const newData = new Hotel_itienrary({
      agency_id: userData[0].role === "agency" ? tokenData.id : undefined,
      admin_id: userData[0].role === "admin" ? tokenData.id : undefined,
      hotel_name,
      hotel_address,
      hotel_city,
      hotel_state,
      hotel_type,
      other,
      hotel_description,
      breakfast_price,
      lunch_price,
      dinner_price,
      rooms,
      breakfast,
      lunch,
      dinner
    });

    if (req.files) {
      newData.hotel_photo = req.files.map((file) => file.filename);
    }

    let result = await newData.save();

    return res.status(200).json({
      success: true,
      message: "Hotel itinerary added successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

exports.getHotelItineraries = async (req, res) => {
  try {
    const itineraries = await Hotel_itienrary.find();

    for (let i = 0; i < itineraries.length; i++) {
      for (let j = 0; j < itineraries[i].hotel_photo.length; j++) {
        itineraries[i].hotel_photo[j] = await image_url(fn, itineraries[i].hotel_photo[j]);
      }
    }

    if (!itineraries) {
      return res.status(200).json({
        success: true,
        message: "hotel_intineraries not found!"
      });
    }
    return res.status(200).json({
      success: true,
      message: "hotel_intineraries find successfully",
      data: itineraries
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

exports.getHotelItineraryById = async (req, res) => {
  try {
    const itinerary = await Hotel_itienrary.findById(req.params.id);

    for (let j = 0; j < itinerary.hotel_photo.length; j++) {
      itinerary.hotel_photo[j] = await image_url(fn, itinerary.hotel_photo[j]);
    }

    if (!itinerary) {
      return res.status(404).json({ success: false, message: "Hotel itinerary not found" });
    }
    return res.status(200).json({
      success: true,
      message: "hotel_intineraries find successfully",
      data: itinerary
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

exports.getHotelItinerariesByAgency = async (req, res) => {
  try {
    const tokenData = req.userData;
    if (tokenData === "") {
      return res.status(401).json({
        message: "Auth fail"
      });
    }
    const userData = await userSchema.find({ _id: tokenData.id });

    if (userData[0].role !== "agency" && userData[0].role !== "admin") {
      throw new Forbidden("you are not agency");
    }

    let itineraries;

    if (userData[0].role === "agency") {
      itineraries = await Hotel_itienrary.aggregate([
        {
          $match: {
            agency_id: mongoose.Types.ObjectId(tokenData.id)
            // admin_id: mongoose.Types.ObjectId(tokenData.id)
          }
        }
      ]);

      for (let i = 0; i < itineraries.length; i++) {
        for (let j = 0; j < itineraries[i].hotel_photo.length; j++) {
          itineraries[i].hotel_photo[j] = await image_url(fn, itineraries[i].hotel_photo[j]);
        }
      }
    } else if (userData[0].role === "admin") {
      itineraries = await Hotel_itienrary.aggregate([
        {
          $match: {
            // agency_id: mongoose.Types.ObjectId(tokenData.id),
            admin_id: mongoose.Types.ObjectId(tokenData.id)
          }
        }
      ]);

      for (let i = 0; i < itineraries.length; i++) {
        for (let j = 0; j < itineraries[i].hotel_photo.length; j++) {
          itineraries[i].hotel_photo[j] = await image_url(fn, itineraries[i].hotel_photo[j]);
        }
      }
    }

    if (!itineraries) {
      return res.status(200).json({
        success: true,
        message: "hotel_intineraries not found!"
      });
    }
    return res.status(200).json({
      success: true,
      message: "hotel_intineraries find successfully",
      data: itineraries
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

exports.updateHotelItinerary = async (req, res) => {
  try {
    const tokenData = req.userData;
    if (tokenData === "") {
      return res.status(401).json({
        message: "Auth fail"
      });
    }
    const userData = await userSchema.find({ _id: tokenData.id });

    if (userData[0].role !== "agency" && userData[0].role !== "admin") {
      throw new Forbidden("you are not agency");
    }

    const updatedData = req.body;

    if (updatedData.rooms && Array.isArray(updatedData.rooms)) {
      const roomTypes = updatedData.rooms.map((room) => room.room_type);
      const uniqueRoomTypes = new Set(roomTypes);
      if (uniqueRoomTypes.size !== roomTypes.length) {
        return res.status(400).json({
          success: false,
          message: "Duplicate room type values are not allowed in rooms."
        });
      }
    }

    let previmages1 = Array.isArray(req.body.previmages) ? req.body.previmages : [req.body.previmages];

    const baseUrl = "https://syt-i471.onrender.com/images/hotel_itienrary/";

    previmages1 = previmages1.filter(Boolean).map((img) => (img.startsWith(baseUrl) ? img.replace(baseUrl, "") : img));

    let previmages2 = req.files ? req.files.map((file) => file.filename) : [];

    updatedData.hotel_photo = [...previmages1, ...previmages2];

    // if (req.files) {
    //     updatedData.hotel_photo = req.files.map(file => file.filename);
    // }

    // if (hotel_photo) {
    //     updatedData.hotel_photo = req.body.hotel_photo;
    // }

    const itinerary = await Hotel_itienrary.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!itinerary) {
      return res.status(404).json({ success: false, message: "Hotel itinerary not found" });
    }

    return res.status(200).json({ success: true, message: "Hotel itinerary updated successfully", data: itinerary });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

exports.deleteHotelItinerary = async (req, res) => {
  try {
    const tokenData = req.userData;
    if (tokenData === "") {
      return res.status(401).json({
        message: "Auth fail"
      });
    }
    const userData = await userSchema.find({ _id: tokenData.id });

    if (userData[0].role !== "agency" && userData[0].role !== "admin") {
      throw new Forbidden("you are not agency");
    }

    const itinerary = await Hotel_itienrary.findByIdAndDelete(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ success: false, message: "Hotel itinerary not found" });
    }

    return res.status(200).json({ success: true, message: "Hotel itinerary deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};
