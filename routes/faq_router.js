const express = require("express");
const router = express.Router();
const faq_controller = require("../controllers/faq_controller");
const faq_Controller = new faq_controller();

router.post("/", (req, res) => faq_Controller.add_faq(req, res));

router.get("/", (req, res) => faq_Controller.get_faq(req, res));

router.get("/byid", (req, res) => faq_Controller.get_faq_byid(req, res));

router.put("/", (req, res) => faq_Controller.update_faq(req, res));

router.delete("/", (req, res) => faq_Controller.delete_faq(req, res));

module.exports = router;
