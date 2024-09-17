const mongoose = require("mongoose");
const { chatbotConnection } = require("../../server");

const offerSchema = new mongoose.Schema({
  clientName: { type: String, required: true, unique: true },
  offers: [
    {
      offer: { type: String, required: true },
      link: { type: String }
    },
  ],
});

const Offers = chatbotConnection.model("Offers", offerSchema);

module.exports = Offers;
