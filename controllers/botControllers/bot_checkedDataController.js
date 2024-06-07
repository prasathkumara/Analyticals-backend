const ClientData = require("../../models/botModels/bot_checkedModel");

const checkedData = async (req, res) => {
    const { clientName } = req.params;
    try {
        
        const { questions, offers, animations } = req.body;
          
        // if (offers && offers.some(offer => !offer.link)) {
        //     return res.status(400).json({ message: 'Each offer must have a link' });
        // }

        let clientData = await ClientData.findOne({ clientName });
        if (!clientData) {
            clientData = new ClientData({
                clientName,
                questions,
                offers,
                animations
            });
        } else {
            if (questions) clientData.questions = questions;
            if (offers) clientData.offers=offers;
            if (animations) clientData.animations = animations;
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
                offers.push(...clientData.offers.map(o => ({ offer: o.offer, link : o.link })));
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

const getSubmittedClientData = async (req, res) => {
    const { clientName } = req.params;

    try {
    const clientData = await ClientData.aggregate([
        { $match: { clientName } },
        {
          $project: {
            _id: 0,
            clientName: 1,
            questions: {
              $map: {
                input: '$questions',
                as: 'question',
                in: { question: '$$question.question' }
              }
            },
            offers: {
              $map: {
                input: '$offers',
                as: 'offer',
                in: { offer: '$$offer.offer', link: '$$offer.link' }
              }
            },
            animations: {
              $map: {
                input: '$animations',
                as: 'animation',
                in: { animation: '$$animation.animation' }
              }
            }
          }
        }
      ]);
  
      if (!clientData.length) {
        return res.status(404).json({ error: 'No data found for the provided client name' });
      }
  
      res.json(clientData[0]);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  



module.exports = {checkedData, getCheckedData, getSubmittedClientData }