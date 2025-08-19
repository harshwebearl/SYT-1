const express = require("express");
const router = express.Router();
const source_Controller = require("../controllers/sourceController");
const source_controller = new source_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => source_controller.add_source(req, res));

router.get("/all", adminUserAuth, (req, res) => source_controller.display_all_source(req, res));

router.get("/", adminUserAuth, (req, res) => source_controller.display_source(req, res));

router.put("/", adminUserAuth, (req, res) => source_controller.update_source(req, res));

router.delete("/delete", adminUserAuth, (req, res) => source_controller.delete_source(req, res));

module.exports = router;
