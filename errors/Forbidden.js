const GeneralError = require("./GeneralError");

module.exports = class Forbidden extends GeneralError {
  errors;

  constructor(message, errors) {
    super(403, "Forbidden", message);
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
