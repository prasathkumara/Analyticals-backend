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
        return res.status(200).json(clientData);
    } catch (error) {
        console.error(`Error storing data for ${clientName}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const getCheckedData = async (req, res) => {
   
    const { inputs , clientName } = req.body;
    
    try {
        const clientData = await ClientData.findOne({ clientName }, { _id: false });

        if (!clientData) {
            return res.status(404).json({ message: `Client data not found for ${clientName}` });
        }

        const responseData = [];
        inputs.forEach(input => {
            const lowerInput = input.toLowerCase();
            if (lowerInput.includes('hi') || lowerInput.includes('hello')) {
                responseData.push(...clientData.questions);
            } else if (lowerInput.includes('offer')) {
                responseData.push(...clientData.offers);
            }
        });

        return res.status(200).json(responseData);
    } catch (error) {
        console.error(`Error retrieving client data for ${clientName}:`, error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}



module.exports = {checkedData, getCheckedData}