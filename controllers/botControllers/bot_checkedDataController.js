const ClientData = require("../../models/botModels/bot_checkedModel");

const checkedData = async (req, res) => {
    try {
        const { clientName } = req.params;
        const { questions, offers, animations } = req.body;

        let clientData = await ClientData.findOne({ clientName });
        if (!clientData) {
            clientData = new ClientData({
                clientName,
                questions,
                offers,
                animations
            });
        } else {
            if (questions) clientData.questions.push(...questions);
            if (offers) clientData.offers.push(...offers);
            if (animations) clientData.animations.push(...animations);
        }
        await clientData.save();
        return res.status(200).json({ message: 'Data Submitted successfully' });
    } catch (error) {
        console.error(`Error storing data for ${clientName}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const getCheckedData = async (req, res) => {
    const { inputs, clientName } = req.body;

    try {
        const clientData = await ClientData.findOne({ clientName }, { _id: false });
        if (!clientData) {
            return res.status(404).json({ message: `Client data not found for ${clientName}` });
        }
        const questions = [];
        const offers = [];

        inputs.forEach(input => {
            const words = input.toLowerCase().split(/\s+/);
            let hasGreeting = false;
            let hasOffer = false;

            words.forEach(word => {
                if (word === 'hi' || word === 'hello') {
                    hasGreeting = true;
                }
                if (word === 'offer' || word.includes('offer')) {
                    hasOffer = true;
                }
            });

            if (hasOffer && clientData.offers && clientData.offers.length > 0) {
                offers.push(...clientData.offers.map(o => ({ offer: o.offer })));
            } else if (hasGreeting && clientData.questions && clientData.questions.length > 0) {
                questions.push(...clientData.questions.map(q => ({ question: q.question })));
            }
        });

        if (questions.length === 0 && offers.length === 0) {
            return res.status(200).json({ message: "Client has no data" });
        }

        const responseData = {};
        if (offers.length > 0) {
            responseData.offers = offers;
        } else if (questions.length > 0) {
            responseData.questions = questions;
        }

        return res.status(200).json(responseData);
    } catch (error) {
        console.error(`Error retrieving client data for ${clientName}:`, error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};



module.exports = {checkedData, getCheckedData}