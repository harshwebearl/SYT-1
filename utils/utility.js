// for multer uploaded ; file location
// req.file.path?.replace(/\\/g, "/").substring("public".length);

// for multer s3 uploaded ; file location or file key
// req.file.key
// req.file.location

const path = require("path"); // for getting file extension
// const multer = require('multer'); // for uploading files
const { v4: uuidv4 } = require("uuid"); // for naming files with random characters

const generateFileName = (timeStamp, originalName) => {
  // IMPROPER CODE DONT USE IT, IF YOU DONT KNOW THE LOGIC
  // This function will be used 99% of time in multer only and not anywhere else
  return timeStamp + "-" + originalName.replace(/[^a-zA-Z0-9]/g, "");
  // return timeStamp + "-" + originalName.replace(/[\W_]+/g, "");
  // return timeStamp + "-" + originalName.replace(/[\W]+/g, "");
  // return req.fileTimeStamp + "-" + file.originalname.replace(/[ ]/g, "");
};

const generateMulterUploadFileName = (fileOriginalName, fileTimeStamp, fileCounter, prefixString) => {
  // This function will be used 99% of time in multer only and not anywhere else

  // Test Condition Below:
  // return fileOriginalName;

  // // fileOriginalName is compulsory.
  // if (!fileOriginalName) {
  //   throw new Error("Not fileOriginalName supplied in generateMulterUploadFileName func");
  // }

  // if (!fileTimeStamp) {
  //   // return d160b410-e6a8-4cbb-92c2-068112187503.jpg
  //   return `${uuidv4()}${path.extname(fileOriginalName)}`;
  // }

  // if (!prefixString) {
  //   return fileTimeStamp + "-" + fileOriginalName.replace(/[ ]/g, "");
  // }

  // if (prefixString) {
  //   return prefixString + fileTimeStamp + "-" + fileOriginalName.replace(/[ ]/g, "");
  // }

  // use encodeS3URI to handle and  replace special characters,symbols for aws s3
  return `${uuidv4()}${path.extname(fileOriginalName)}`;
};

const generateMulterUploadFilePath = (hostStorage, filePath) => {
  const generatedPath =
    hostStorage === "local"
      ? // ./uploads/... (relative path for local storage)
        // `./${filePath}/`
        `${filePath}/`
      : // uploads/...
        `${filePath}/`;
  // console.log(generatedPath);
  return generatedPath;
};

const generateDownloadLink = (FilePathFromDB, localHostURL) => {
  // localHostURL = req.localHostURL // added into CORS Header

  // req.localHostURL = `${req.protocol}://${req.get("host")}`;
  // req.completeURLWithParams = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  // req.completeURLWithoutParams = `${req.protocol}://${req.get("host")}${req.originalUrl.split("?").shift()}`;

  return process?.env?.ACTIVE_STORAGE === "local"
    ? // http://127.0.0.1:3000/filepath
      `${localHostURL}/${encodeS3URI(FilePathFromDB)}`
    : // https://start-your-tour-uploads.s3.ap-south-1.amazonaws.com/filepath
      `${process.env._AWS_BUCKET_URL}/${encodeS3URI(FilePathFromDB)}`;
};

const generateFilePathForDB = (file) => {
  // file = req.file
  // eg; uploads/admin/1.png
  if (process?.env?.ACTIVE_STORAGE === "local") {
    return file?.path?.replace(/\\/g, "/") || undefined;
  } else {
    return file?.key || undefined;
  }
};

const generateFileDownloadLinkPrefix = (localHostURL) => {
  return process?.env?.ACTIVE_STORAGE === "local"
    ? // http://127.0.0.1:3000/filepath
      `${localHostURL}/`
    : // https://start-your-tour-uploads.s3.ap-south-1.amazonaws.com/filepath
      `${process.env._AWS_BUCKET_URL}/`;
};

/*!
 * node-s3-url-encode - Because s3 urls are annoying
 */

const encodings = {
  "+": "%2B",
  "!": "%21",
  '"': "%22",
  "#": "%23",
  "$": "%24",
  "&": "%26",
  "'": "%27",
  "(": "%28",
  ")": "%29",
  "*": "%2A",
  ",": "%2C",
  // '\:': "%3A", due to https:
  ";": "%3B",
  "=": "%3D",
  "?": "%3F",
  "@": "%40",
  // extra added by me for :  spaces, tabs, newlines and Unicode spaces.
  " ": "+"
};

function encodeS3URI(filename) {
  // return encodeURI(filename) // Do the standard url encoding
  return typeof filename === "string"
    ? `${filename}`.replace(/(\+|!|"|#|\$|&|'|\(|\)|\*|\+|,|:|;|=|\?|@| )/gim, function (match) {
        return encodings[match] || "";
      })
    : "";
}

module.exports = {
  // generateFileName,
  generateMulterUploadFileName,
  generateMulterUploadFilePath,
  generateDownloadLink,
  generateFilePathForDB,
  generateFileDownloadLinkPrefix
};
