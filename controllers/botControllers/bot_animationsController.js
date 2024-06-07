const Animations = require("../../models/botModels/bot_animationsModel");
const ClientData = require("../../models/botModels/bot_checkedModel");
const Client = require("../../models/botModels/bot_questionsModel");

const createAnimations = async (req, res) => {
  const { clientName } = req.params;
  const animations = req.body;
  try {
    let client = await Animations.findOne({ clientName });

    if (!client) {
      client = new Animations({ clientName });
    }

    if (!Array.isArray(animations)) {
      return res
        .status(400)
        .json({ message: "Offers must be provided as an array" });
    }

    animations.forEach((animationData) => {
      const { animation } = animationData;
      client.animations.push({ animation });
    });
    await client.save();

    res.status(201).json({ message: "Animations Added Successfully" });
  } catch (error) {
    console.error(`Error creating animation for ${clientName}:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAnimations = async (req, res) => {
  const { clientName } = req.params;
  try {
    let client = await Animations.findOne({ clientName }).select("animations.animation -_id")

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(client.animations);
  } catch (error) {
    console.error(`Error retrieving Animations for ${clientName}:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const submitAnimationData = async (req, res) => {
  const { clientName } = req.params;

  try {
    const animationData = await ClientData.findOne({ clientName }).select("animations.animation -_id");

    if (!animationData || !animationData.animations.length) {
      return res.status(404).json({ error: 'No data found for the provided client name' });
    }

    res.json(animationData.animations);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = { createAnimations, getAnimations, submitAnimationData };
