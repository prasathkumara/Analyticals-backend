const { dbConnection } = require("../server");
const storeData = async (req, res) => {
  try {
    const db = await dbConnection();
    const userData = req.body;
    const userIp = userData.userInfo[0].ip;
    console.log(userIp)

    // Get the current date and time
    const currentDate = new Date();
    //currentDate.setDate(currentDate.getDate() -1 );
   
    const formattedDate = currentDate.toISOString().slice(0, 10);
 console.log(formattedDate)
    // Fetch existing user data based on IP address
    const existingUser = await db.collection('userEvents').findOne({
      'userInfo.ip': userIp,
    });

    if (existingUser) {
      // Update existing user data
      await db.collection('userEvents').updateOne(
        { 'userInfo.ip': userIp },
        {
          $set: {
            'userInfo': [userData.userInfo[0]],
            'userEvents': userData.userEvents
          },

        }
      );
      console.log('Data updated into MongoDB');
      res.status(200).json({ message: 'Data updated successfully', data:userData});
    } else {
      // Insert data into MongoDB for a new user on the specified date
      await db.collection('userEvents').insertOne({
        'userInfo': [userData.userInfo[0]],
        'userEvents': [{
          date: formattedDate,
          ...userData.userEvents[0] || {},
         
        }]
      });

      console.log('Data inserted into MongoDB');
      res.status(200).json({ message: 'Data stored successfully'});
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

    res.status(200).json(allData);
  } catch (err) {
    console.error('Error retrieving data from MongoDB:', err);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = { storeData, getAllData };




