const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  clientName: { type: String, required: true, unique: true },
  questions: [
    {
      question: { type: String, required: true },
    },
  ],
});

const Questions = mongoose.model("Questions", questionSchema);

module.exports = Questions;
