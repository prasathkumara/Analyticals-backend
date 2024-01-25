const { dbConnection } = require("../server");

const getUserData = async (req, res) => {
  try {
    const db = await dbConnection();
    const ip = req.params.ip; // Assuming username is passed as a parameter in the URL

    // Retrieve data based on the username
    const userData = await db.collection('userEvents').findOne({
      'userInfo.ip': ip,
    });

    if (userData) {
      res.status(200).json([userData]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error('Error retrieving data by username from MongoDB:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


module.exports = { getUserData };

