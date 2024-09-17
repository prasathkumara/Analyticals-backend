const mongoose = require("mongoose");
const { chatbotConnection } = require("../../server");

const animationSchema = new mongoose.Schema({
  clientName: { type: String, required: true, unique: true },
  animations: [
    {
      animation: { type: String, required: true },
    },
  ],
});

const Animations = chatbotConnection.model("Animations", animationSchema);

module.exports = Animations; 
