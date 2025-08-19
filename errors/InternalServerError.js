const GeneralError = require("./GeneralError");

module.exports = class InternalServerError extends GeneralError {
  errors;

  constructor(message, errors) {
    super(500, "Internal Server Error", message);
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
