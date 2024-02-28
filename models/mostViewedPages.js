const mongoose = require('mongoose');

const mostViewedPageSchema = new mongoose.Schema({
    mostViewdPage: String,
    pageAndCounts: Object
}, { strict: false });

const MostViewedPage = mongoose.model('MostViewedPage',mostViewedPageSchema);

module.exports = MostViewedPage;