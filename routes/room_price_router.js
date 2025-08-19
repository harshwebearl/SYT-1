const router = require("express").Router();
const room_price_controller = require("../controllers/room_price_controller");
const adminUserAuth = require("../middleware/admin-user-auth");


router.post("/room_price", adminUserAuth, room_price_controller.addRoomPrice);
router.post("/update", adminUserAuth, room_price_controller.updateRoomPrice);



module.exports = router