
const mongoose = require('mongoose');
const mongoURL = "mongodb+srv://cynnent:cynnent123@cluster0.0ybxpvk.mongodb.net/web";

const dbConnection = async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log("Database connected successfully");
    return mongoose.connection.db; //This object represents the connected database.
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

module.exports = { dbConnection };
