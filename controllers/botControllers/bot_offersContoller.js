const Offers = require("../../models/botModels/bot_offersModel");

const createOffers = async (req, res) => {
  const { clientName } = req.params;
  const offers = req.body;

  console.log("Request Body:", req.body); // Log the request body

  try {
    let client = await Offers.findOne({ clientName });

    if (!client) {
      client = new Offers({ clientName });
    }

    if (!Array.isArray(offers)) {
      return res
        .status(400)
        .json({ message: "Offers must be provided as an array" });
    }

    offers.forEach((offerData) => {
      const { offer } = offerData;
      client.offers.push({ offer });
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
    const client = await Offers.findOne({ clientName });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(client.offers);
  } catch (error) {
    console.error(`Error retrieving offers for ${clientName}:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createOffers,
  getOffers,
};
