const mongoose = require("mongoose");
const { chatbotConnection } = require("../../server");

const questionSchema = new mongoose.Schema({
  clientName: { type: String, required: true, unique: true },
  questions: [
    {
      question: { type: String, required: true },
    },
  ],
});

const Questions = chatbotConnection.model("Questions", questionSchema);

module.exports = Questions;
