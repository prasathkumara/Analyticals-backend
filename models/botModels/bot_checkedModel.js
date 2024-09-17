const mongoose = require('mongoose');
const { chatbotConnection } = require('../../server');

const clientDataSchema = new mongoose.Schema({
    clientName: { type: String, required: true, unique: true },
    questions: [
        {
            question: { type: String, required: true }
        }
    ],
    offers: [
        {
            offer: { type: String, required: true },
            link: { type: String }
        }
    ],
    animations: [
        {
            animation: { type: String, required: true }
        }
    ]
});

const ClientData = chatbotConnection.model('ClientData', clientDataSchema);

module.exports = ClientData;
