const nodemailer = require("nodemailer");

module.exports = transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  service: "gmail",
  auth: {
    user: /* process.env.EMAIL || */ "krunal.webearl@gmail.com",
    pass: /* process.env.PASSWORD || */ "kmc@191020"
  }
});
