const MostViewedPage = require("../models/mostViewedPages");
const User = require("../models/userModel");

const  screenCount=  async (req, res) => {
    const users = await User.find();
   
// Function to process and store N number of data
async function processAndStoreData(dataArray) {
    for (const item of dataArray) {
      const processedData = {
        userId: item._id,
        screens: {}
      };
  
      item.userEvents.forEach((event) => {
        Object.entries(event.screens).forEach(([screen, counts]) => {
          Object.entries(counts).forEach(([btn, count]) => {
            processedData.screens[screen] = (processedData.screens[screen] || 0) + count;
          });
        });
      });
  
      console.log("Processed Data:", processedData);
  
      // Store the processed data in the database (you can customize this part)
      await storeDataInDatabase(processedData);
    }
  }
      
// Function to store data in the database
    async function storeDataInDatabase(processedData) {
    // Your database connection and insertion code here
    console.log(`Storing data in the database for userId: ${processedData.userId}`);
  }   
// Call the function to process and store data
    processAndStoreData(users);
      
};


const mostViewedPage = async (req, res) => {
  try {
    const users = await User.find();
    // Check if there is an existing document in the "mostviewedpage" collection
    const existingMostViewedPage = await MostViewedPage.findOne();

    // Function to calculate the most clicked screen
    const getMostClickedScreen = (data) => {
      const screenCounts = {};
      console.log("1.data",data)
      // Iterate through the data to calculate counts for each screen
      data.forEach(item => {
        console.log('2.item', item)
        if (item.userEvents) {
          console.log("3.user events",item.userEvents)
          item.userEvents.forEach(event => {
            console.log("4.event",event)
            if (event.screens) {

              console.log('5.event screens',event.screens)
              Object.entries(event.screens).forEach(([screen, counts]) => {
                console.log("6.",event.screens[screen])
                if (!screenCounts[screen]) {
                  console.log("7.",event.screens[screen])
                  console.log("7c.",event.screens[counts])
                  screenCounts[screen] = 0;
                }
                Object.values(counts).forEach(count => {
                  console.log("8.",event.screens[screen])
                  console.log("8c.",event.screens[counts])
                  screenCounts[screen] += count;
                });
              });
            }
          });
        }
      });
      console.log('result',screenCounts)
      // Sort the screens based on counts in descending order
      const sortedScreens = Object.keys(screenCounts).sort((a, b) => screenCounts[b] - screenCounts[a]);

      return {
        mostViewedPages: sortedScreens.map(screen => ({ pageName: screen, count: screenCounts[screen] })),
      };
    };

    // Call the function to get the most clicked screen
    const result = getMostClickedScreen(users);

    // If there is an existing document, update it; otherwise, create a new one
    if (existingMostViewedPage) {
      await MostViewedPage.updateOne({}, result);
    } else {
      const mostViewedPage = new MostViewedPage(result);
      await mostViewedPage.save();
    }

    res.json(result);
  } catch (error) {
    console.error('Error processing most viewed page data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


module.exports = {screenCount, mostViewedPage}
