"use strict";

// Email functionality disabled - not in use
async function sendMails(emailFrom, emailList, mailSubject, mailPlainText, mailHTML) {
  console.log("Email functionality is disabled");
  return {
    success: false,
    message: "Email functionality is disabled",
    messageId: null
  };
}

module.exports = {
  sendMails
};
