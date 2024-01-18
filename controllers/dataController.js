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
      // Update the specific index in the userEvents array based on the date
      const indexToUpdate = existingUser.userEvents.findIndex(event => event.date === formattedDate);

      if (indexToUpdate !== -1) {
        // Merge the existing data with the new data
        const updatedScreen1 = {
          ...(existingUser.userEvents[indexToUpdate].screen1 || {}),
          ...(userData.userEvents[0].screen1 || {})
        };

        const updatedScreen2 = {
          ...(existingUser.userEvents[indexToUpdate].screen2 || {}),
          ...(userData.userEvents[0].screen2 || {})
        };

        // Update the existing data in MongoDB
        await db.collection('userEvents').updateOne(
          {
            'userInfo.ip': userIp,
            'userEvents.date': formattedDate
          },
          {
            $set: {
              [`userEvents.${indexToUpdate}.screen1`]: updatedScreen1,
              [`userEvents.${indexToUpdate}.screen2`]: updatedScreen2,
              'userInfo': [userData.userInfo[0]]
            }
          }
        );

        console.log('Data updated in MongoDB');
        res.status(200).json({ message: 'Data updated successfully' });
      } else {
        console.error('Error: Index not found for the specified date');
        res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      // Insert data into MongoDB for a new user on the specified date
      await db.collection('userEvents').updateOne(
        { 'userInfo.ip': userIp },
        {
          $set: { 'userInfo': [userData.userInfo[0]] },
          $push: {
            userEvents: {
              date: formattedDate,
              screen1: userData.userEvents[0].screen1 || {},
              screen2: userData.userEvents[0].screen2 || {}
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
}

module.exports = { storeData };



