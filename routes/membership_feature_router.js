const express = require('express');
const router = express.Router();
const membership_feature_controller = require('../controllers/membership_feature_controller');
const feature_valueController = new membership_feature_controller();
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/",adminUserAuth,(req,res)=> feature_valueController.add_membership_feature(req,res));

router.get("/",(req,res)=> feature_valueController.display_membership_feature(req,res));

router.get("/byid",(req,res)=> feature_valueController.display_membership_feature_byid(req,res));

router.put("/",adminUserAuth,(req,res)=> feature_valueController.update_membership_feature(req,res));

router.delete("/",adminUserAuth,(req,res)=> feature_valueController.delete_membership_feature(req,res));

module.exports = router;