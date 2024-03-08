const mongoose = require("mongoose");

const mapdataSchema = new mongoose.Schema(
    {
        _id : String,
        clientName : String,
        latitude : String,
        longitude : String,
        country : String,
        cityName: String
},{ _id: false})

const MapData = mongoose.model("mapData",mapdataSchema);
module.exports = MapData;
