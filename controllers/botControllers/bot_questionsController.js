const Questions = require("../../models/botModels/bot_questionsModel");
const Client = require("../../models/botModels/bot_questionsModel");

const createQuestions = async (req, res) => {
  const { clientName } = req.params;
  const questions = req.body;

  try {
    let client = await Questions.findOne({ clientName });

    if (!client) {
      client = new Questions({ clientName });
    }

    if (!Array.isArray(questions)) {
      return res
        .status(400)
        .json({ message: "Offers must be provided as an array" });
    }

    questions.forEach((questionData) => {
      const { question } = questionData;
      client.questions.push({ question });
    });
    await client.save();
    res.status(201).json({ message: "Questions Added Successfully" });
  } catch (error) {
    console.error(`Error creating question for ${clientName}:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getQuestions = async (req, res) => {
  const { clientName } = req.params;
  try {
    const client = await Questions.findOne({ clientName }).select("questions.question -_id")

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(client.questions);
  } catch (error) {
    console.error(`Error retrieving Questions for ${clientName}:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createQuestions, getQuestions };
