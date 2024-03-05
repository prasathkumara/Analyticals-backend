const mongoose = require("mongoose");

const deviceDataSchema = new mongoose.Schema({
        _id: String,
        clientName: String,
        DeviceName: String,
},
{ _id: false }
);

const DeviceData = mongoose.model("DeviceData",deviceDataSchema)
module.exports = DeviceData;