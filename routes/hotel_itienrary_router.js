const express = require('express');
const router = express.Router();
const hotel_itienrary_controller = require("../controllers/hotel_itienrary_controller");
const adminUserAuth = require('../middleware/admin-user-auth');
const multer = require("multer")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/hotel_itienrary"); // Set the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, (Date.now() + file.originalname).replace(/\s+/g, "")); // Set a unique filename for the uploaded file
    }
});

// Set the upload limits for files
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload a valid image file"));
        }
        cb(null, true);
    }
});


router.post("/create", upload.array("hotel_photo"), adminUserAuth, hotel_itienrary_controller.hotel_itienrary_create);
router.get("/displayAll", hotel_itienrary_controller.getHotelItineraries);
router.get("/displayById/:id", hotel_itienrary_controller.getHotelItineraryById);
router.put("/update/:id", upload.array("hotel_photo"), adminUserAuth, hotel_itienrary_controller.updateHotelItinerary);
router.delete("/delete/:id", adminUserAuth, hotel_itienrary_controller.deleteHotelItinerary);
router.get("/displayAgencyById", adminUserAuth, hotel_itienrary_controller.getHotelItinerariesByAgency)


module.exports = router