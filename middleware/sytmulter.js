const multer = require("multer");
const path = require("path");

let destinationPath = ""; // Global variable to store the destination path

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, destinationPath); // Specify the destination folder
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = (Date.now() + file.originalname).replace(/\s+/g, "");
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload a valid image file"));
    }
    cb(null, true);
  }
});
module.exports = {
  upload,
  setDestinationPath: (path) => {
    destinationPath = path; // Setter function to set the destination path
  }
};
