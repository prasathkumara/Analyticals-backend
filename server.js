// import { MongoClient } from "mongodb";

// const mongoURI= "mongodb://127.0.0.1:27017"
// async function createConnection(){
//     const client = new MongoClient(mongoURI);
//     await client.connect()
//     console.log("mongodb is connected suucessfully")
//     return client
// }
//  export {createConnection}

// server.js

const mongoose = require('mongoose');
const mongoURL = "mongodb+srv://prasath12:prasath123@cluster0.btxw1s3.mongodb.net/web";

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
