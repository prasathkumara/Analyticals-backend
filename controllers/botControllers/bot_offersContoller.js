const Animations = require("../../models/botModels/bot_animationsModel");
const Offers = require("../../models/botModels/bot_offersModel");
const Questions = require("../../models/botModels/bot_questionsModel");

const createOffers = async (req, res) => {
  const { clientName } = req.params;
  const offers = req.body;

  try {
    let client = await Offers.findOne({ clientName });

    if (!client) {
      client = new Offers({ clientName, offers: [] });
    }

    if (!Array.isArray(offers)) {
      return res
        .status(400)
        .json({ message: "Offers must be provided as an array" });
    }

    offers.forEach((offerData) => {
      const { offer, link } = offerData;
      client.offers.push({ offer, link });
    });

    await client.save();
    res.status(201).json({ message: "Offers Added Successfully" });
  } catch (error) {
    console.error(`Error creating offer for ${clientName}:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getOffers = async (req, res) => {
  const { clientName } = req.params;
  try {
    const client = await Offers.findOne({ clientName }).select('offers.offer offers.link -_id');

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(client.offers);
  } catch (error) { 
    console.error(`Error retrieving offers for ${clientName}:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const clienBotData = async(req, res) =>{
  const { clientName } = req.params;

  try {
      const questionsData = await Questions.aggregate([
          { $match: { clientName: clientName } },
          { $unwind: "$questions" },
          { $project: { _id: 0, question: "$questions.question" } }
      ]);
  
      const offersData = await Offers.aggregate([
          { $match: { clientName: clientName } },
          { $unwind: "$offers" },
          { $project: { _id: 0, offer: "$offers.offer", link:"$offers.link" } }
      ]);
  
      const animationData = await Animations.aggregate([
          { $match: { clientName: clientName } },
          { $unwind: "$animations" },
          { $project: { _id: 0, animation: "$animations.animation" } }
      ]);

   if (!questionsData.length && !offersData.length && !animationData.length) {
    return res.status(404).json({ error: 'No data found for the provided client name' });
}

      const responseData = {
          questions: questionsData,
          offers: offersData,
          animations: animationData 
      };
  
      res.json(responseData);
  } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
  

}

module.exports = {
  createOffers,
  getOffers, 
  clienBotData
};
