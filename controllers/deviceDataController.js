const DeviceData = require("../models/deviceData");

const saveDeviceData = async (req, res) => {
    const { _id, clientName, DeviceName } = req.body;

    try {
        // Check if device data already exists for the user
        const existingDeviceData = await DeviceData.findOne({ _id });
        if (!_id || !clientName || !DeviceName) {
            return res.status(400).json({ message: 'Missing required fields in the payload.' });
        }
        if (existingDeviceData) {
            // Handle the case where device data already exists for the user
            return res.status(400).json({ message: 'Device data already exists for the user.' });
        }

        const newDeviceData = new DeviceData({ _id, clientName, DeviceName });
        const savedData = await newDeviceData.save();
        res.status(200).json({ message: "Device Data added successfully"});
    } catch (error) {
        console.error('Error creating device data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const getAllUserDeviceData = async (req, res) => {
    try {
        const client = req.params.clientName
        const allUserDeviceData = await DeviceData.find({'clientName': client});
        if(allUserDeviceData.length === 0){
            return res.json({ message: `No data found for the client name: ${client}.` });
        }
        res.status(200).json( allUserDeviceData );
    } catch (error) {
        console.error('Error fetching user device data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const mostUsedDevices = async (req, res) => {
    try {
      const client = req.params.clientName;
  
      const result = await DeviceData.aggregate([
        { $match: { 'clientName': client } }, // Filter documents by clientName
        { $group: { _id: '$DeviceName', count: { $sum: 1 } } }, // Group by DeviceName and count occurrences
        { $project: { DeviceName: '$_id', count: 1, _id: 0 } }, // Project to rename _id to DeviceName
        { $sort: { count: -1 } } // Sort by count in descending order
      ]);
  
      if (result.length === 0) {
        return res.json({ message: `No data found for the client name: ${client}.` });
      }
  
      res.json(result);
    } catch (error) {
      console.error('Error processing most used devices data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  

module.exports = { saveDeviceData, getAllUserDeviceData, mostUsedDevices};