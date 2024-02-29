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

 
  const mostVisitedPage = async (req, res) => {
    try {
      const db = await dbConnection();

  const allData = await db.collection('userEvents').find({}).toArray();

  
  const getMostClickedScreen = (data) => {
    const screenCounts = {};
  
    // Iterate through the data to calculate counts for each screen
    data.forEach(item => {
      if (item.userEvents) {
        item.userEvents.forEach(event => {
          // Check if the screens object is directly inside userEvents
          const screens = event.screens || event;
  
          Object.entries(screens).forEach(([screen, counts]) => {
            if (!screenCounts[screen]) {
              screenCounts[screen] = 0;
            }
            if (typeof counts === 'object') {
              Object.values(counts).forEach(count => {
                screenCounts[screen] += count;
              });
            } else if (typeof counts === 'number') {
              screenCounts[screen] += counts;
            }
          });
        });
      }
    });
  
    // Exclude "date" and "totalCount" from the result
    delete screenCounts['date'];
    delete screenCounts['totalCount'];
  
    // Sort the screens based on counts in descending order
    const sortedScreens = Object.keys(screenCounts).sort((a, b) => screenCounts[b] - screenCounts[a]);
  
    return {
      mostViewedPages: sortedScreens.map(screen => ({ pageName: screen, count: screenCounts[screen] })),
    };
  };
  
  
  
      const result = getMostClickedScreen(allData);
  
     console.log('result',result)
      res.json(result);
    } catch (error) {
      console.error('Error processing most viewed page data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  


const mostClickedAction = async(req, res) =>{

  try {

    const db = await dbConnection();

    const allData = await db.collection('userEvents').find({}).toArray();
   console.log(allData)
   const getTotalClickedCounts = (data) => {
    const buttonCounts = {};
  
    // Iterate through the data to calculate counts for each button
    data.forEach(item => {
      if (item.userEvents) {
        item.userEvents.forEach(event => {
          if (event) {
            Object.entries(event).forEach(([screen, buttons]) => {
              Object.entries(buttons).forEach(([button, count]) => {
                // Filter out entries with non-alphabetic button names or names that are too short
                if (typeof button === 'string' && button.length > 1) {
                  if (!buttonCounts[button]) {
                    buttonCounts[button] = 0;
                  }
                  buttonCounts[button] += parseInt(count, 10) || 0;
                }
              });
            });
          }
        });
      }
    });
  
    // Sort the buttons based on counts in descending order
    const sortedButtons = Object.keys(buttonCounts).sort((a, b) => buttonCounts[b] - buttonCounts[a]);
  
    // Create the result object
    const mostClickedButtons = sortedButtons.map(button => ({ ButtonName: button, count: buttonCounts[button] }));
  
    return { mostClickedButtons };
  };
  
    // Call the function to get the total clicked counts for each button
    const result = getTotalClickedCounts(allData);
    console.log(result);
    res.json(result);
  } catch (error) {
    console.error('Error processing most viewed page data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }

  
    
  }

module.exports = { storeData, getAllData, mostVisitedPage , mostClickedAction };

