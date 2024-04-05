const MapData = require("../models/mapData")

const mapData = async(req,res) =>{
    const { _id, clientName, latitude, longitude, country, cityName } = req.body; 
    try {
        const newMapData = new MapData({ _id, clientName, latitude, longitude, country, cityName });
        const savedData = await newMapData.save();
        res.status(200).json({message:"map Data added successfully"})
    } catch (error) {
        console.error('Error creating mapdata:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


const getAllMapData = async(req,res) =>{
    try {
        const client = req.params.clientName
        const allUserMapData  = await MapData.find({'clientName': client});
        if(allUserMapData.length === 0){
            return res.json({ message: `No data found for the client name: ${client}.` });
        }
       
       return res.status(200).json(allUserMapData)
    } catch (error) {
        console.error('Error creating mapdata:', error);
       return res.status(500).json({ message: 'Internal Server Error' });
    }
}

const usersByCountry = async (req, res) => {
    try {
      const client = req.params.clientName;
  
      const result = await MapData.aggregate([
        { $match: { 'clientName': client } },
        { $group: { _id: { country: '$country', city: '$cityName' }, users: { $sum: 1 } } },
        { $project: { _id: 0, cityName: '$_id.city', users: 1, country: '$_id.country' } }
      ]);
  
      res.json(result);
    } catch (error) {
      console.error('Error processing user per city data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  const accesedCountryCount = async (req, res) => {
    try {
      const client = req.params.clientName;
      const allUserMapData = await MapData.find({ clientName: client });
      if (allUserMapData.length === 0) {
        return res.json({
          message: `No data found for the client name: ${client}.`,
        });
      } 
        const countryCounts = {};
  
        allUserMapData.forEach((item) => {
          if (countryCounts[item.country]) {
            countryCounts[item.country]++;
          } else {
            countryCounts[item.country] = 1;
          }
        });
  
        const sortedCountries = Object.keys(countryCounts).sort(
          (a, b) => countryCounts[b] - countryCounts[a]
        );
  
        const topThree = sortedCountries.slice(0, 3).map((country, index) => ({
          label: country,
          id: `file${index + 1}`,
          value: countryCounts[country],
        }));
        return res.status(200).json(topThree);
  
    } catch (error) {
      console.error("Error processing user per city data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  



module.exports = {mapData, getAllMapData, usersByCountry, accesedCountryCount};