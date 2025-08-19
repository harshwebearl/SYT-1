const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendor_car.Controller");
const adminUserAuth = require("../middleware/admin-user-auth");
const multer = require("multer")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/vendor_car"); // Set the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Set a unique filename for the uploaded file
    }
});

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

router.get("/getAll", adminUserAuth, vendorController.getVendorCars);

router.get("/DisplayAll", vendorController.getAllVendorCars);

router.get("/getById/:id", vendorController.getVendorCarById);

router.post("/", adminUserAuth, upload.array('photos'), vendorController.createVendorCar);

router.delete("/:id", adminUserAuth, vendorController.deleteVendorCar);

router.put('/update/:venderCarId', upload.array('photos'), adminUserAuth, vendorController.updateVendorCar)

router.get("/vendorCarListByAdmin", adminUserAuth, vendorController.adminVendorCarList)

module.exports = router;
