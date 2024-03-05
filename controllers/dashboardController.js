const User = require("../models/userModel");

const clientData = async (req, res) => {
    try {
        const users = await User.find();

        // Extract unique client names
        const uniqueClientNames = [...new Set(users.map(user => user.userInfo.clientName))];

        // Format the result
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

module.exports = { clientData,  getUsersByClientName  };







