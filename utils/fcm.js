const gcm = require("node-gcm");

const sender = new gcm.Sender(process.env.fcm_key);

// Prepare a message to be sent
const message = new gcm.Message({
  priority: "high",
  contentAvailable: true,
  delayWhileIdle: true,
  notification: {
    icon: process.env.fcm_icon_url,
    click_action: process.env.client_url,
  },
});

const sendMessage = async (regTokens, title, body) => {
  message.addNotification("title", title);
  message.addNotification("body", body);
  try {
    await sender.send(message, { registrationTokens: regTokens });
  } catch (error) {
    console.log("Cannot send FCM", error);
  }
};

module.exports = sendMessage;
