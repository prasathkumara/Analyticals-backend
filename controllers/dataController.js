const { dbConnection } = require("../server");

const storeData = async (req, res) => {
  try {
    const db = await dbConnection();
    const userData = req.body;
    const userIp = userData.userInfo[0].ip;

    // Get the current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10);

    // Check if the user with the given IP address and date already exists
    const existingUser = await db.collection('userEvents').findOne({
      'userInfo.ip': userIp,
      'userEvents.date': formattedDate
    });

    if (existingUser) {
      // Update the existing user's data
      const updatedScreens = {};
      userData.userEvents.forEach((screenData, index) => {
        updatedScreens[`userEvents.$.${`screen${index + 1}`}`] = screenData || {};
      });

      await db.collection('userEvents').updateOne(
        {
          'userInfo.ip': userIp,
          'userEvents.date': formattedDate
        },
        {
          $set: {
            'userInfo': [userData.userInfo[0]],
            ...updatedScreens
          }
        }
      );

      console.log('Data updated in MongoDB');
      res.status(200).json({ message: 'Data updated successfully' });
    } else {
      // Insert data into MongoDB for a new user on the specified date
      const screensData = {};
      userData.userEvents.forEach((screenData, index) => {
        screensData[`screen${index + 1}`] = screenData || {};
      });

      await db.collection('userEvents').updateOne(
        { 'userInfo.ip': userIp },
        {
          $set: { 'userInfo': [userData.userInfo[0]] },
          $push: {
            userEvents: {
              date: formattedDate,
              ...screensData
            }
          }
        },
        { upsert: true }
      );

      console.log('Data inserted into MongoDB');
      res.status(200).json({ message: 'Data stored successfully' });
    }
  } catch (err) {
    console.error('Error inserting/updating data into MongoDB:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllData= async(req, res) => {
  try {
    const db = await dbConnection();

    // Retrieve all data from MongoDB using Mongoose
    const allData = await db.collection('userEvents').find({}).toArray();

    res.status(200).json({data:allData});
  } catch (err) {
    console.error('Error retrieving data from MongoDB:', err);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = { storeData, getAllData };




