const express = require("express");
const router = express.Router();
const CarController = require("../controllers/car_syt_controller");
const carController = new CarController();

const multer = require("multer");
const adminUserAuth = require("../middleware/admin-user-auth");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/car_syt");
    },
    filename: function (req, file, cb) {
        cb(null, (Date.now() + file.originalname).replace(/\s+/g, ""));
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

const cp = upload.fields([{ name: "photo", maxCount: 1 }]);

router.post("/", adminUserAuth, cp, (req, res) => carController.addCar(req, res));
router.get("/", adminUserAuth, (req, res) => carController.getAllCars(req, res));
router.put("/", adminUserAuth, cp, (req, res) => carController.editCar(req, res));
router.delete("/", adminUserAuth, (req, res) => carController.deleteCar(req, res));

module.exports = router;
