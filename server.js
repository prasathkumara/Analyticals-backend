const mongoose = require('mongoose');
const webMongoURL = "mongodb+srv://cynnent:cynnent123@cluster0.0ybxpvk.mongodb.net/wat";
const chatbotMongoURL = "mongodb+srv://cynnent:cynnent123@cluster0.0ybxpvk.mongodb.net/alex-chatbot";

const connectWebDB = async () => {
  try {
    await mongoose.connect(webMongoURL);
    console.log("Connected to the 'wat' database");
  } catch (error) {
    console.error("Error connecting to the 'wat' database:", error);
  }
};

const chatbotConnection = mongoose.createConnection(chatbotMongoURL);

chatbotConnection.on('connected', () => {
  console.log("Connected to the 'alex-chatbot' database");
});

chatbotConnection.on('error', (error) => {
  console.error("Error connecting to the 'alex-chatbot' database:", error);
});

module.exports = { connectWebDB, chatbotConnection };

