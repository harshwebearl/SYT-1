const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerMiddleware = require("../middleware/sytmulter.js");
const { uploadFile } = require("../middleware/genericMulter.js");

// Test server running or not
router.get("/", (req, res) => {
  // Test Server Running
  res.status(200).json({
    text: "GET /test called : Server Application is running successfully.",
    decodedAuth: req.userData || null,
    authToken: req.get("Authorization") || null
  });
});

// Test Global error handler
router.delete("/", (req, res) => {
  // Test Global Error
  throw new Error("Testing Global Error");
});

// Test multipart formdata parsing
router.post(
  "/",
  uploadFile(
    process?.env?.ACTIVE_STORAGE,
    "fields",
    [
      { name: "photo", maxCount: 6 },
      { name: "photos", maxCount: 6 }
    ], // String for single, Arr for fields
    "uploads/test" // ""
  ),
  (req, res, next) => {
    // Test Multipart Formdata Parsing
    try {
      // console.log("body", req.body);
      // console.log("file", req.file);
      // console.log("files", req.files);
      res.status(200).json({
        reqBody: req?.body,
        reqFile: req?.file,
        reqFiles: req?.files
      });
    } catch (err) {
      console.log(err);
      res.errored("GOT ERROR.");
      // NOTE SYNC functions error is by default caught by express but ASYNC function's error in not caught by express
      // logger.error(req.method + ": " + req.originalUrl + ", message: " + err.message)
      // next(createError.InternalServerError())
    }
  }
);

module.exports = router;
