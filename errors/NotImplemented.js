const GeneralError = require("./GeneralError");

module.exports = class NotImplemented extends GeneralError {
  errors;

  constructor(message, errors) {
    super(501, "Not Implemented", message);
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
