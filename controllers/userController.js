const { dbConnection } = require("../server");

const getUserData = async (req, res) => {
  try {
    const db = await dbConnection();
     // Get the current date and time
     const currentDate = new Date();
     const formattedDate = currentDate.toISOString().slice(0, 10);
    // Fetch user data based on IP address or any other relevant identifier
    const userIp = req.ip; // Update this based on your authentication logic
    console.log('userip------>', userIp);

    const userData = await db.collection('userEvents').findOne({
      'userInfo.ip': userIp,
      'userEvents.date': formattedDate
    });

    res.status(200).json(userData || {});
    console.log('user data---->', userData);
  } catch (err) {
    console.error('Error fetching user data from MongoDB:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = { getUserData };

