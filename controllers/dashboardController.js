const User = require("../models/userModel");

const clientData = async (req, res) => {
    try {
        const users = await User.find();
        const uniqueClientNames = [...new Set(users
            .filter(user => user.userInfo && user.userInfo.clientName)
            .map(user => user.userInfo.clientName)
        )];

        const result = uniqueClientNames.map(clientName => ({ clientName }));

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching client names:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


const getUsersByClientName = async (req, res) => {
    try {
        const { clientName } = req.params;

        if (!clientName) {
            return res.status(400).json({ message: 'ClientName parameter is required' });
        }

        const users = await User.find({ 'userInfo.clientName': clientName }, '_id');

        if (users.length === 0) {
            return res.status(404).json({ message: `No users found for clientName: ${clientName}` });
        }

        res.status(200).json(users.map(user => ({ _id: user._id })));
    } catch (error) {
        console.error('Error fetching users by clientName:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const MostViewedBrowsers  =  async (req, res) => {
    try {
        const client = req.params.clientName
        const users = await User.find({ 'userInfo.clientName': client });
        if(users.length === 0){
          return res.json({ message: `No data found for the client name: ${client}.` });
      }
        // Group users by browserName and count occurrences
        const browserCounts = await User.aggregate([
          { $match: { 'userInfo.clientName': client } },
          { $group: { _id: '$userInfo.browserName', count: { $sum: 1 } } },
          { $project: { _id: 0, browserName: '$_id', count: 1 } },
          { $sort: { count: -1 } }
        ]);
    
        res.json(browserCounts);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  }
    
module.exports = { clientData,  getUsersByClientName, MostViewedBrowsers  };







