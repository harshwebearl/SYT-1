const fs = require("fs");
const path = require("path");

const { generateMulterUploadFileName, generateMulterUploadFilePath } = require("../utils/utility");
const multer = require("multer");
// const multerS3 = require("multer-s3");
// const aws = require("aws-sdk");
// aws.config.update({
//   secretAccessKey: process.env._AWS_SECRET_ACCESS_KEY,
//   accessKeyId: process.env._AWS_ACCESS_KEY_ID,
//   region: process.env._AWS_BUCKET_REGION
// });
// s3 = new aws.S3();

// How to Call:
// uploadFile(
//   "aws", //           "local"   /   "aws"
//   "fields", //        "single"  / "fields"
//   //                          /   [
//   //          "agency_logo"   /       { name: "pancard_image", maxCount: 1 },
//   //                          /       { name: "agency_logo", maxCount: 1 },
//   //                          /   ],

//   "public/images/destinationCategory" // "File Location"
// )
const uploadFile = (
  hostStorage = "local",
  storageType = "any",
  config,
  // destinationFolderPath from root without starting "/" slash
  // examples eg;
  // Correct : uploads/brands/
  // Wrong : /uploads/brands/ or /uploads/brands
  destinationFolderPath
) => {
  let upload;

  const limits = {
    fieldNameSize: 300,
    // b -> bit, B -> Bytes
    // fileSize: 102400, // 100 KB, 1KB = 1024 Bytes
    fileSize: 1 * 1024 * 1024 // 1 Mb
    // fileSize: MB * KB * 1024, // 1 MB
    // fileSize: 2 * 1024 * 1024, // 2MB , k means 1000 (decimal kilo) , K means binary kilo
  };

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      return cb(null, true);
    } else if (file.mimetype === "application/pdf") {
      return cb(null, true);
    } else if (file.mimetype === "application/vnd.ms-excel") {
      return cb(null, true);
    } else if (file.mimetype === "application/vnd.openxmlformatsofficedocument.spreadsheetml.sheet") {
      return cb(null, true);
    } else {
      return cb(new AppError("Not an image! Please upload images only.", 400), false);
    }

    //
    // if (
    //   file.mimetype == "application/pdf" ||
    //   file.mimetype == "image/png" ||
    //   file.mimetype == "image/jpg" ||
    //   file.mimetype == "image/jpeg"
    // ) {
    //   return cb(null, true);
    // } else {
    //   return cb(null, false);
    //   const err = new Error("Only .pdf, .png, .jpg and .jpeg format allowed!");
    //   err.name = "ExtensionError";
    //   return cb(err);
    // }
  };

  // console.log(1);
  // defining multer storage
  const getStorage = (hostStorage) => {
    return multer({
          limits: limits,
          fileFilter: fileFilter,
          storage: multer.diskStorage({
            destination: async (req, file, cb) => {
              // console.count("test");
              //note: always append files at the end of formData, not at the start,to access other fields too.
              const path = generateMulterUploadFilePath(
                hostStorage,
                destinationFolderPath || `public/uploads/${file?.fieldname || "fieldname"}`
              );
              fs.mkdirSync(path, { recursive: true });
              return cb(null, path);
            },
            filename: (req, file, cb) => {
              // cb(null, file.originalname);
              cb(null, `${generateMulterUploadFileName(file?.originalname || "originalname")}`);
            }
          })
        })
      // : multer({
      //     storage: multerS3({
      //       s3: s3,
      //       acl: "public-read",
      //       contentType: multerS3.AUTO_CONTENT_TYPE,
      //       bucket: process.env._AWS_BUCKET_NAME,
      //       limits: limits,
      //       fileFilter: fileFilter,
      //       key: function (req, file, cb) {
      //         // console.log(file);
      //         cb(
      //           null,
      //           `${generateMulterUploadFilePath(
      //             hostStorage,
      //             destinationFolderPath || `uploads/${file?.fieldname || "fieldname"}`
      //           )}${generateMulterUploadFileName(file?.originalname || "originalname")}`
      //           // // req.userType +
      //           // file.fieldname +
      //           //   "_" +
      //           //   // new Date().toISOString().replace(/:/g, "-") +
      //           //   req.userId +
      //           //   "_" +
      //           //   req.imgCounter++ +
      //           //   path.extname(file.originalname)
      //         );
      //         // cb(
      //         //   null,
      //         //   "public/images/brand/" +
      //         //     generateMulterUploadFileName(req.fileTimeStamp, file.originalname)
      //         // ); //use Date.now() for unique file keys
      //       }
      //     })
      //   });
  };

  // const localStorage = ;
  // console.log(2);
  // const awsStorage = ;
  // console.log(3);
  if (storageType === "single") {
    // upload = hostStorage === "local" ? localStorage.single(config) : awsStorage.single(config);
    upload = getStorage(hostStorage).single(config);
  } else if (storageType === "array") {
    // upload = hostStorage === "local" ? localStorage.array(config) : awsStorage.array(config);
    upload = getStorage(hostStorage).array(config);
  } else if (storageType === "fields") {
    // upload = hostStorage === "local" ? localStorage.fields(config) : awsStorage.fields(config);
    upload = getStorage(hostStorage).fields(config);
  } else if (storageType === "any") {
    // upload = hostStorage === "local" ? localStorage.any() : awsStorage.any();
    upload = getStorage(hostStorage).any();
  } else {
    // upload = hostStorage === "local" ? localStorage.none() : awsStorage.none();
    upload = getStorage(hostStorage).none();
  }
  // console.log(4);
  return (req, res, next) => {
    // console.log(4.1);
    return upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.log("MulterError", err);
      } else if (err) {
        // An unknown error occurred when uploading.
        // Work best when have [*option1]
        console.log("UnhandledError", err);
      }
      // console.log(5);
      if (err && err.name && err.name === "MulterError") {
        return res.status(500).send({
          code: 500,
          error: err.name,
          message: `File upload error: ${err.message}`
        });
      }
      // console.log(6);
      // handle other errors
      if (err) {
        return res.status(500).send({
          code: 500,
          message: `Something wrong ocurred when trying to upload the file`,
          error: "FILE UPLOAD ERROR"
        });
      }
      // console.log(7);
      next();
    });
  };
};

module.exports = { uploadFile };
