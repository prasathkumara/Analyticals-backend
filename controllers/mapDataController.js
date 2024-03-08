const MapData = require("../models/mapData")

const mapData = async(req,res) =>{
    const { _id, clientName, latitude, longitude, country, cityName } = req.body; 
    try {
        const newMapData = new MapData({ _id, clientName, latitude, longitude, country, cityName });
        const savedData = await newMapData.save();
        res.status(200).json({message:"map Data added successfully", savedData})
    } catch (error) {
        console.error('Error creating mapdata:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


const getAllMapData = async(req,res) =>{
    try {
        const data  = await MapData.find();
        res.status(200).json(data)
    } catch (error) {
        console.error('Error creating mapdata:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}



module.exports = {mapData, getAllMapData};