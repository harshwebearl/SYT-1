const GeneralError = require("./GeneralError");
module.exports = class BadRequest extends GeneralError {
  errors;

  constructor(message, errors) {
    super(400, "Bad Request", message);
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      status: this.status,
      message: this.message,
      errors: this.errors
    };
  }
};
