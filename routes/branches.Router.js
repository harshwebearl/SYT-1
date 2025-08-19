const express = require("express");
const router = express.Router();
const branches_Controller = require("../controllers/branchesController");
const Branches_controller = new branches_Controller();
// const isAuthAllowed = require("../middleware/isAuthAllowed");
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => Branches_controller.add_branches(req, res));

router.get("/all", adminUserAuth, (req, res) => Branches_controller.display_all_branches(req, res));

router.get("/", adminUserAuth, (req, res) => Branches_controller.display_branches(req, res));

router.put("/", adminUserAuth, (req, res) => Branches_controller.update_branches(req, res));

router.delete("/delete", adminUserAuth, (req, res) => Branches_controller.delete_branches(req, res));

module.exports = router;
