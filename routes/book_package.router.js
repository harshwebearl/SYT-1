const express = require("express");
const router = express.Router();
const book_package_Controller = require("../controllers/book_package.controller");
const book_package_controller = new book_package_Controller();
const adminUserAuth = require("../middleware/admin-user-auth");
const { uploadFile } = require("../middleware/genericMulter.js");
const isAuthAllowed = require("../middleware/isAuthAllowed");

// Add BookPackage
router.post("/", adminUserAuth, (req, res) => book_package_controller.bookpackage(req, res));

// Get BookPackageList [Agency]
router.get("/bookpackageforagency", adminUserAuth, (req, res) =>
  book_package_controller.display_book_package_for_agency(req, res)
);

// Get BookPackageList
router.get("/", adminUserAuth, (req, res) => book_package_controller.display_book_packages(req, res));

router.get("/bookpackagedetail", adminUserAuth, (req, res) =>
  book_package_controller.display_book_packages_details(req, res)
);

// Update BookPackageStatus
router.put("/", adminUserAuth, (req, res) => book_package_controller.update_book_status(req, res));

//new route by jaydev
router.get("/jaydev", adminUserAuth, (req, res) => book_package_controller.display_book_packages_jaydev(req, res));

router.get("/admin_booked_package_list", adminUserAuth, (req, res) =>
  book_package_controller.display_book_packages_by_admin(req, res)
);

router.get("/bookpackagedetail_jaydev", adminUserAuth, (req, res) =>
  book_package_controller.displayBookPackagesDetails_jaydev(req, res)
);

router.get("/bookpackageforadmin", adminUserAuth, (req, res) =>
  book_package_controller.display_book_package_for_admin(req, res)
);

router.get("/bookpackageforagency_jaydev", adminUserAuth, (req, res) =>
  book_package_controller.display_book_package_for_agency_jaydev(req, res)
);

router.get("/booked_package_list", adminUserAuth, (req, res) =>
  book_package_controller.display_booked_package_for_agency(req, res)
);

router.get("/admin_booked_package_list_with_token", adminUserAuth, (req, res) =>
  book_package_controller.admin_booked_package_list(req, res)
);

router.get("/book_package_details_user", adminUserAuth, (req, res) =>
  book_package_controller.booked_package_details_by_user(req, res)
);

module.exports = router;
