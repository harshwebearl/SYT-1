const express = require("express");
const router = express.Router();
const bidPackage = require("../controllers/BidPackage.Controller");
const BidPackage = new bidPackage();
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");

// Add BidPackage
router.post("/", adminUserAuth, (req, res) => BidPackage.addBidPackage(req, res));

// Get BidPackage [User]
router.get("/displaybidpackages", adminUserAuth, (req, res) => BidPackage.displayUserBidPackage(req, res));

// Update Services
router.put("/:id", adminUserAuth, (req, res) => BidPackage.updateServices(req, res));

// Update BidStatus
router.put("/updateBidStatus/:id", adminUserAuth, (req, res) => BidPackage.aproveRejectBid(req, res));

// Get BidPackageList
router.get("/", adminUserAuth, (req, res) => BidPackage.getbidData(req, res));

// Get BidPackageList [Agency]
router.get("/agencybid", adminUserAuth, (req, res) => BidPackage.display_agency_bid(req, res));

router.get("/displayadminbid", adminUserAuth, (req, res) => BidPackage.adminside_bid_detail(req, res));
// Get BidPackage
router.get("/biddetails", adminUserAuth, (req, res) => BidPackage.getbidDetails(req, res));

router.get("/agencydisplaybid", adminUserAuth, (req, res) => BidPackage.get_bid(req, res));

// Update Bid [Agency]
router.put("/", adminUserAuth, (req, res) => BidPackage.update_bid_by_agency(req, res));


//new route by jaydev
router.get("/displaybidpackages_jaydev", adminUserAuth, (req, res) => BidPackage.displayUserBidPackage_jaydev(req, res));
router.get("/agencybid_jaydev", adminUserAuth, (req, res) => BidPackage.display_agency_bid_jaydev(req, res));
router.get("/biddetails_jaydev", adminUserAuth, (req, res) => BidPackage.getbidDetails_jaydev(req, res));

// router.put("/checkDate", adminUserAuth, (req, res) => BidPackage.checkAndExpireBids(req, res));

router.post("/check_and_expire", adminUserAuth, (req, res) => BidPackage.checkAndExpireBids(req, res))


module.exports = router;
