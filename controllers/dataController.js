const { dbConnection } = require("../server");

const storeData = async (req, res) => {
  try {
    const db = await dbConnection();
    const userData = req.body;
    const userIp = userData.userInfo[0].ip;

    // Get the current date and time
    const currentDate = new Date();
    //currentDate.setDate(currentDate.getDate() + 2);
    const formattedDate = currentDate.toISOString().slice(0, 10); 

     // Get the current day
     const currentDayNumber = currentDate.getDay();
     const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
     const currentDay = daysOfWeek[currentDayNumber];

    // Fetch existing user data based on IP address
    const existingUser = await db.collection('userEvents').findOne({
      'userInfo.ip': userIp,
    });

    if (existingUser) {
      // Check if there is data for the current date
      const existingEventData = existingUser.userEvents.find(event => event.date === formattedDate);

      if (existingEventData) {
        // Update the existing data for the current date
        const updatedUserEvents = existingUser.userEvents.map(event => {
          if (event.date === formattedDate) {
            return {
              ...Object.keys(userData.userEvents[0]).reduce((acc, screen) => {
                acc[screen] = {
                  ...(event[screen] || {}),
                  ...(userData.userEvents[0][screen] || {}),
                };
                return acc;
              }, {}),
            };
          }
          return event;
        });

        await db.collection('userEvents').updateOne(
          {
            'userInfo.ip': userIp,
            'userEvents.date': formattedDate
          },
          {
            $set: {
              'userEvents': updatedUserEvents,
              'userInfo': [userData.userInfo[0]],
            }
          }
        );

        console.log('Data updated in MongoDB');
        res.status(200).json({ message: 'Data updated successfully', data: userData });
      } else {
        // Insert new data for the current date
        await db.collection('userEvents').updateOne(
          { 'userInfo.ip': userIp },
          {
            $set: { 'userInfo': [userData.userInfo[0]] },
            $addToSet: {
              'userEvents': {
                ...Object.keys(userData.userEvents[0]).reduce((acc, screen) => {
                  acc[screen] = userData.userEvents[0][screen] || {};
                  return acc;
                }, {}),
              }
            }
          }
        );

        console.log('Data inserted into MongoDB');
        res.status(200).json({ message: 'Data stored successfully', data: userData });
      }
    } else {
      // Insert data into MongoDB for a new user on the specified date
      await db.collection('userEvents').insertOne({
        'userInfo': [userData.userInfo[0]],
        'userEvents': [{
          ...Object.keys(userData.userEvents[0]).reduce((acc, screen) => {
            acc[screen] = userData.userEvents[0][screen] || {};
            return acc;
          }, {}),
        }]
      });

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

    res.status(200).json({allData});
  } catch (err) {
    console.error('Error retrieving data from MongoDB:', err);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = { storeData, getAllData };




