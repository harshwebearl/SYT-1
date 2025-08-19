const GeneralError = require("./GeneralError");

module.exports = class NotFound extends GeneralError {
  errors;

  constructor(message, errors) {
    super(404, "Not Found", message);
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
