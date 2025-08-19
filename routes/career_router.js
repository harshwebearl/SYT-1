const express = require('express');
const router = express.Router();
const career_controller = require('../controllers/career_controller');
const careerController = new career_controller();
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/", adminUserAuth, (req, res) => careerController.add_career(req, res));

router.get("/", (req, res) => careerController.display_career(req, res));


router.get("/detail", (req, res) => careerController.display_career_by_id(req, res));

router.put("/", adminUserAuth, (req, res) => careerController.update_career(req, res));

router.delete('/', adminUserAuth, (req, res) => careerController.delete_career(req, res));

module.exports = router;