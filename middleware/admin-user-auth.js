const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

module.exports = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization) {
      token = req.headers.authorization.split(" ")[0];
      // console.log(token);
      const decoded = await jwt.verify(token, "WebEarl1");
      // console.log('token',token);
      req.userData = decoded;
    } else {
      req.userData = "";
    }
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Auth fail"
    });
  }
};
