// SMS functionality disabled - not in use

const sendSMS = async (isdCode, toPhone, msgBody) => {
  console.log("SMS functionality is disabled");
  return {
    success: false,
    message: "SMS functionality is disabled",
    sid: null
  };
};

// Dummy client object for compatibility
const client = {
  messages: {
    create: () => Promise.resolve({ sid: null, status: "disabled" })
  }
};

module.exports = {
  client,
  sendSMS
};
