const mongoose = require("mongoose");
const VendorCar = require("../models/vendor_car_schema");
const userschema = require("../models/usersSchema");
const image_url = require("../update_url_path.js");
const fn = "vendor_car";

exports.getVendorCars = async (req, res) => {
  try {
    const tokenData = req.userData;
    if (tokenData === "") {
      return res.status(401).json({
        message: "Auth fail"
      });
    }
    const userData = await userschema.find({ _id: tokenData.id });
    if (userData[0].role !== "agency" && userData[0].role !== "customer") {
      throw new Forbidden("you are not agency");
    }

    let vendorData = [];

    if (userData[0].role === "agency") {
      console.log("agency");

      vendorData = await VendorCar.aggregate([
        {
          $match: {
            vendor_id: new mongoose.Types.ObjectId(tokenData.id)
          }
        },
        {
          $lookup: {
            from: "cars",
            localField: "car_id",
            foreignField: "_id",
            as: "car_details"
          }
        },
        {
          $sort: { _id: -1 }
        }
      ]);
    } else if (userData[0].role === "customer") {
      console.log("customer");
      // Handle customer-specific logic here if needed
      vendorData = await VendorCar.aggregate([
        {
          $lookup: {
            from: "cars",
            localField: "car_id",
            foreignField: "_id",
            as: "car_details"
          }
        },
        {
          $sort: { _id: -1 }
        }
      ]);
    }

    for (let i = 0; i < vendorData.length; i++) {
      // Convert photos in vendorData to full image URLs
      for (let j = 0; j < vendorData[i].photos.length; j++) {
        vendorData[i].photos[j] = await image_url(fn, vendorData[i].photos[j]);
      }

      // Convert photos in car_details to full image URLs and add to photos array
      for (let k = 0; k < vendorData[i].car_details.length; k++) {
        if (vendorData[i].car_details[k].photo) {
          vendorData[i].car_details[k].photo = await image_url("car_syt", vendorData[i].car_details[k].photo);
          // vendorData[i].photos.push(carPhotoUrl); // Add car photo URL to photos array
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Vendor Car Find Successfully",
      data: vendorData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

exports.getAllVendorCars = async (req, res) => {
  try {
    const tokenData = req.userData;
    if (tokenData === "") {
      return res.status(401).json({
        message: "Auth fail"
      });
    }
    const userData = await userschema.find({ _id: tokenData.id });
    if (userData[0].role !== "agency") {
      throw new Forbidden("you are not agency");
    }

    let vendorData = await VendorCar.aggregate([
      {
        $match: {
          vendor_id: new mongoose.Types.ObjectId(tokenData.id)
        }
      },
      {
        $lookup: {
          from: "cars",
          localField: "car_id",
          foreignField: "_id",
          as: "car_details"
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    for (let i = 0; i < vendorData.length; i++) {
      // Convert photos in vendorData to full image URLs
      for (let j = 0; j < vendorData[i].photos.length; j++) {
        vendorData[i].photos[j] = await image_url(fn, vendorData[i].photos[j]);
      }

      // Convert photos in car_details to full image URLs and add to photos array
      for (let k = 0; k < vendorData[i].car_details.length; k++) {
        if (vendorData[i].car_details[k].photo) {
          vendorData[i].car_details[k].photo = await image_url("car_syt", vendorData[i].car_details[k].photo);
          // vendorData[i].photos.push(carPhotoUrl); // Add car photo URL to photos array
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Vendor Car Find Successfully",
      data: vendorData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

exports.getVendorCarById = async (req, res) => {
  try {
    let { id } = req.params;

    let vendorData = await VendorCar.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(id) }
      },
      {
        $lookup: {
          from: "cars",
          localField: "car_id",
          foreignField: "_id",
          as: "car_details"
        }
      }
    ]);

    for (let i = 0; i < vendorData.length; i++) {
      // Convert photos in vendorData to full image URLs
      for (let j = 0; j < vendorData[i].photos.length; j++) {
        vendorData[i].photos[j] = await image_url(fn, vendorData[i].photos[j]);
      }

      // Convert photos in car_details to full image URLs and add to photos array
      for (let k = 0; k < vendorData[i].car_details.length; k++) {
        if (vendorData[i].car_details[k].photo) {
          vendorData[i].car_details[k].photo = await image_url("car_syt", vendorData[i].car_details[k].photo);
          // vendorData[i].photos.push(carPhotoUrl); // Add car photo URL to photos array
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Vendor Car Find Successfully",
      data: vendorData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

exports.createVendorCar = async (req, res) => {
  try {
    const tokenData = req.userData;
    if (!tokenData) {
      return res.status(401).json({
        message: "Auth fail"
      });
    }

    const userData = await userschema.find({ _id: tokenData.id });
    if (!userData || userData.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (userData[0].role !== "agency") {
      return res.status(403).json({
        message: "You are not agency"
      });
    }

    // if (!req.files || !req.files.photos || req.files.photos.length === 0) {
    //     return res.status(400).json({
    //         message: "No photos uploaded"
    //     });
    // }

    let exitsRegistrationNumber = await VendorCar.findOne({ registration_number: req.body.registration_number });

    if (exitsRegistrationNumber) {
      return res.status(403).json({
        success: false,
        message: "Registration number already exists"
      });
    }

    const newVendorCar = new VendorCar({
      car_id: req.body.car_id,
      vendor_id: tokenData.id,
      car_condition: req.body.car_condition,
      model_year: req.body.model_year,
      insurance: req.body.insurance,
      photos: req.files.map((file) => file.filename),
      registration_number: req.body.registration_number,
      color: req.body.color,
      price_per_km: req.body.price_per_km,
      min_price_per_day: req.body.min_price_per_day,
      pincode: req.body.pincode,
      city: req.body.city,
      state: req.body.state,
      outStateAllowed: req.body.outStateAllowed,
      AC: req.body.AC
    });

    let result = await newVendorCar.save();
    return res.status(200).json({
      success: true,
      message: "VenderCar Insert Successfully",
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

exports.deleteVendorCar = async (req, res) => {
  try {
    const tokenData = req.userData;
    if (tokenData === "") {
      return res.status(401).json({
        message: "Auth fail"
      });
    }
    const userData = await userschema.find({ _id: tokenData.id });
    if (userData[0].role !== "agency") {
      throw new Forbidden("you are not agency");
    }
    VendorCar.findById(req.params.id)
      .then((vendorCar) => {
        vendorCar.remove().then(() => res.status(200).json({ success: true, message: "Car Deleted Successfully" }));
      })
      .catch((err) => res.status(404).json({ novendorcarfound: "No vendor car found" }));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

exports.updateVendorCar = async (req, res) => {
  try {
    const tokenData = req.userData;
    if (!tokenData) {
      return res.status(401).json({
        message: "Auth fail"
      });
    }

    const userData = await userschema.findById(tokenData.id);
    if (!userData || userData.role !== "agency") {
      return res.status(403).json({
        message: "You are not authorized to perform this action"
      });
    }

    const { venderCarId } = req.params;

    let updateData = {
      car_id: req.body.car_id,
      car_condition: req.body.car_condition,
      model_year: req.body.model_year,
      insurance: req.body.insurance,
      registration_number: req.body.registration_number,
      color: req.body.color,
      price_per_km: req.body.price_per_km,
      min_price_per_day: req.body.min_price_per_day,
      pincode: req.body.pincode,
      city: req.body.city,
      state: req.body.state,
      allowed: req.body.allowed,
      AC: req.body.AC
    };

    let previmages1 = Array.isArray(req.body.previmages) ? req.body.previmages : [req.body.previmages];

    console.log("previmages1 " + previmages1);

    const baseUrl = "https://syt-i471.onrender.com/images/vendor_car/";

    previmages1 = previmages1.filter(Boolean).map((img) => (img.startsWith(baseUrl) ? img.replace(baseUrl, "") : img));

    console.log("IMAGE LOG  " + previmages1);

    // if (req.files && req.files.length > 0) {
    //   const previmages2 = req.files.map((file) => file.filename);
    // }
    let previmages2 = req.files ? req.files.map((file) => file.filename) : [];

    console.log("previmages2 ..." + previmages2);

    updateData.photos = [...previmages1, ...previmages2];

    console.log("data.." + updateData.photos);

    const updatedData = await VendorCar.findByIdAndUpdate(venderCarId, updateData, { new: true });

    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: "Vendor Car not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor Car Updated Successfully",
      data: updatedData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

exports.adminVendorCarList = async (req, res) => {
  try {
    const tokenData = req.userData;
    if (!tokenData) {
      return res.status(401).json({
        message: "Auth fail"
      });
    }

    const userData = await userschema.findById(tokenData.id);
    if (!userData || userData.role !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to perform this action"
      });
    }
    let { vendor_id } = req.query;
    let adminDisplayList = await VendorCar.aggregate([
      {
        $match: {
          vendor_id: new mongoose.Types.ObjectId(vendor_id)
        }
      },
      {
        $lookup: {
          from: "cars",
          localField: "car_id",
          foreignField: "_id",
          as: "car_details"
        }
      }
    ]);

    for (let i = 0; i < adminDisplayList.length; i++) {
      // Convert photos in adminDisplayList to full image URLs
      for (let j = 0; j < adminDisplayList[i].photos.length; j++) {
        adminDisplayList[i].photos[j] = await image_url(fn, adminDisplayList[i].photos[j]);
      }

      // Convert photos in car_details to full image URLs and add to photos array
      for (let k = 0; k < adminDisplayList[i].car_details.length; k++) {
        if (adminDisplayList[i].car_details[k].photo) {
          adminDisplayList[i].car_details[k].photo = await image_url(
            "car_syt",
            adminDisplayList[i].car_details[k].photo
          );
          // adminDisplayList[i].photos.push(carPhotoUrl); // Add car photo URL to photos array
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Vendor car list display successsfully",
      data: adminDisplayList
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
