const express = require('express');
const router = express.Router();
const career_category_controller = require('../controllers/career_category_controller');
const career_categoryController = new career_category_controller();
const adminUserAuth = require("../middleware/admin-user-auth");

router.post("/",adminUserAuth,(req,res)=> career_categoryController.add_career_category(req,res));

router.get("/",(req,res)=> career_categoryController.display_career_category(req,res));

router.put("/",adminUserAuth,(req,res)=> career_categoryController.update_career_category(req,res));

router.delete('/',adminUserAuth,(req,res)=> career_categoryController.delete_career_category(req,res));

module.exports = router;