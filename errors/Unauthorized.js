const GeneralError = require("./GeneralError");

module.exports = class Unauthorized extends GeneralError {
  errors;

  constructor(message, errors) {
    super(401, "Unauthorized", message);
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
