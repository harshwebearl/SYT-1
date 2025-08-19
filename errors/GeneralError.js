module.exports = class GeneralError extends Error {
  code;

  status;

  constructor(code, status, message) {
    super(message);
    this.code = code;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }

  getCode() {
    return this.code;
  }

  toJSON() {
    return {
      code: this.code,
      status: this.status,
      message: this.message
    };
  }
};
