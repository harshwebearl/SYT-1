// import firebase-admin package
const admin = require("firebase-admin");

// import service account file (helps to know the firebase project details)
const serviceAccount = require("./serviceAccountKey.json");

// Intialize the firebase-admin project/account
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.log(error);
}

// const registrationToken =
// ("dbNFQpY-rHTVMPbnUR92Xu:APA91bGXuIAaRejjPpkvwkVMErsboCd3KyOd3LZKC8z9yJemtYBR7ydajL3-NS7FsoUxFPGluEfnat8ehgC2c8Kz8P5LG7bLJ_UKsX9TK0-Jw3ZczBQpbfAwbGEFyqgWOLxhh4gDrMcy");

// const message = {
//   notification: {
//     title: "Account Deposit",
//     body: "A deposit to your savings account has just cleared.",
//   },
//   token: registrationToken,
// };

// // Send a message to the device corresponding to the provided
// // registration token.
// admin
//   .messaging()
//   .send(message)
//   .then((response) => {
//     // Response is a message ID string.
//     console.log("Successfully sent message:", response);
//   })
//   .catch((error) => {
//     console.log("Error sending message:", error);
//   });

// // These registration tokens come from the client FCM SDKs.
// const registrationTokens = [
//   "dbNFQpY-rHTVMPbnUR92Xu:APA91bGXuIAaRejjPpkvwkVMErsboCd3KyOd3LZKC8z9yJemtYBR7ydajL3-NS7FsoUxFPGluEfnat8ehgC2c8Kz8P5LG7bLJ_UKsX9TK0-Jw3ZczBQpbfAwbGEFyqgWOLxhh4gDrMcy",
//   "fMwexaRBfknFxtWEuh5QYp:APA91bG703k0JGe9HsC4wv2z9L2rpuxcHwGf-ZbJkxXDGxUS3h11fXdiARvsSpnYU7CwDnlYK34uL0a59nGacP4U0-MTJM6L5j3jZK0_y0z19deiqcVQsBLvDTWQnFKE3eOUafY5aQGV",
//   "dluYbPxlz8qteBW_HeT_P2:APA91bEMo3bPD9wR8WpMkCBGa43BvuqLN5A-G0PGfCPZX6luHkt94EnJMtA8mEaQ29T37T73Fuo0Dt_u8bj2VTzhi4ezbQDk1fn-ElVKPXTNGYeEmwzfn2bEyQ91Zm6cjXVffV3lhEny",
// ];

// const message = {
//   notification: {
//     title: "Account Deposit",
//     body: "A deposit to your savings account has just cleared.",
//   },
//   tokens: registrationTokens,
// };

// admin
//   .messaging()
//   .sendMulticast(message)
//   .then((response) => {
//     if (response.failureCount > 0) {
//       const failedTokens = [];
//       response.responses.forEach((resp, idx) => {
//         if (!resp.success) {
//           failedTokens.push(registrationTokens[idx]);
//         }
//       });
//       console.log("List of tokens that caused failures: " + failedTokens);
//     }
//   });

// const registrationTokens = [
//   "dbNFQpY-rHTVMPbnUR92Xu:APA91bGXuIAaRejjPpkvwkVMErsboCd3KyOd3LZKC8z9yJemtYBR7ydajL3-NS7FsoUxFPGluEfnat8ehgC2c8Kz8P5LG7bLJ_UKsX9TK0-Jw3ZczBQpbfAwbGEFyqgWOLxhh4gDrMcy",
//   "fMwexaRBfknFxtWEuh5QYp:APA91bG703k0JGe9HsC4wv2z9L2rpuxcHwGf-ZbJkxXDGxUS3h11fXdiARvsSpnYU7CwDnlYK34uL0a59nGacP4U0-MTJM6L5j3jZK0_y0z19deiqcVQsBLvDTWQnFKE3eOUafY5aQGV",
//   "dluYbPxlz8qteBW_HeT_P2:APA91bEMo3bPD9wR8WpMkCBGa43BvuqLN5A-G0PGfCPZX6luHkt94EnJMtA8mEaQ29T37T73Fuo0Dt_u8bj2VTzhi4ezbQDk1fn-ElVKPXTNGYeEmwzfn2bEyQ91Zm6cjXVffV3lhEny",
// ];

// registrationTokens.map((token) => {
//   admin
//     .messaging()
//     .send(
//       (message = {
//         notification: {
//           title: "Account Deposit",
//           body: "A deposit to your savings account has just cleared.",
//         },
//         data: {
//           myData: "ad",
//         },
//         token: token,
//       })
//     )
//     .then((response) => {
//       // Response is a message ID string.
//       console.log("Successfully sent message:", response);
//     })
//     .catch((error) => {
//       console.log("Error sending message:", error);
//     });
// });

const sendNotification = async (myDeviceType, myDeviceToken, myMessageObj, userName) => {
  // console.log("LOG", 1, myMessageObj);

  const myMessage = {};
  if (myMessageObj?.notification) {
    myMessage.notification = {
      title: myMessageObj?.notification?.title,
      body: myMessageObj?.notification?.body
    };
  }

  if (myMessageObj?.data) {
    myMessage.data = {
      ...myMessageObj.data
    };
  }

  if (myDeviceType === "android" || myDeviceType === "web") {
    if (!!myDeviceToken) {
      admin
        .messaging()
        .send({
          ...myMessage,
          token: myDeviceToken
        })
        .then((response) => {
          // Response is a message ID string.
          // console.log("Successfully sent message:\n", userName, "\n", response);
        })
        .catch((error) => {
          // console.log("Error sending message:\n", userName, "\n", error);
        });
    } else {
      // console.log("Error sending message:\n myDeviceToken is invalid");
    }
  }
};

module.exports = admin;
module.exports = sendNotification;
