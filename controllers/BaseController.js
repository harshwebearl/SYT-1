// import * as JSONBig from 'json-bigint';
const JSONBig = require("json-bigint");
const GeneralError = require("../errors/GeneralError");
const logger = require("../config/winston.config");
module.exports = class BaseController {
  sendJSONResponse(res, message, metadata, data) {
    const response = {
      code: 200,
      status: "OK",
      message
    };
    if (metadata) {
      response.metadata = metadata;
    }
    response.data = data;
    return res.status(200).contentType("application/json;charset=utf-8").send(JSONBig.stringify(response));
  }

  sendErrorResponse(req, res, err) {
    console.log(err);
    // logger.error(req.method + ": " + req.originalUrl + ", message: " + err.message)
    // logger.error(err)
    // logger.info(err)
    // logger.warn(err)
    // logger.debug(err)
    // logger.trace(err)

    if (err instanceof GeneralError) {
      return res.status(err.getCode() || 500).json(err.toJSON());
    }

    return res.status(500).json({
      code: 500,
      status: "Internal Server Error",
      message: err.message
    });
  }
};
