const mongoose = require('mongoose');

const mostClickedActionsSchema = new mongoose.Schema({}, { strict: false });

const MostClickedActions = mongoose.model('MostClickedActions',mostClickedActionsSchema);

module.exports = MostClickedActions; 