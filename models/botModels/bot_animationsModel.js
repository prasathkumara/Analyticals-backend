const mongoose = require("mongoose");

const animationSchema = new mongoose.Schema({
  clientName: { type: String, required: true, unique: true },
  animations: [
    {
      animation: { type: String, required: true },
    },
  ],
});

const Animations = mongoose.model("Animations", animationSchema);

module.exports = Animations;
