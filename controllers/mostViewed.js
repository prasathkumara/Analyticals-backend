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
    const client = req.params.clientName;
    const users = await User.find({ 'userInfo.clientName': client });
    if (users.length === 0) {
      return res.json({ message: `No data found for the client name: ${client}.` });
    }

    const getMostClickedScreen = (data) => {
      const screenCounts = {};
      let totalCount = 0;

      // Calculate total count and counts for each screen
      data.forEach(item => {
        if (item.userEvents) {
          item.userEvents.forEach(event => {
            if (event.screens) {
              Object.entries(event.screens).forEach(([screen, counts]) => {
                if (!screenCounts[screen]) {
                  screenCounts[screen] = 0;
                }
                Object.values(counts).forEach(count => {
                  screenCounts[screen] += count;
                  totalCount += count;
                });
              });
            }
          });
        }
      });

      // Calculate percentages for each screen
      const mostViewedPages = Object.keys(screenCounts).map(screen => ({
        pageName: screen,
        percentage: ((screenCounts[screen] / totalCount) * 100).toFixed(2)

        //percentage: Math.round((screenCounts[screen] / totalCount) * 100) -- Calculate percentage and round to the nearest integer
        // percentage: ((screenCounts[screen] / totalCount) * 100).toFixed(2) --- Calculate percentage and round to 2 decimal places
      }));

      // Sort the screens based on counts in descending order
      mostViewedPages.sort((a, b) => b.percentage - a.percentage);

      return { mostViewedPages };
    };

    const result = getMostClickedScreen(users);
    res.json(result.mostViewedPages);
  } catch (error) {
    console.error('Error processing most viewed page data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {screenCount, mostViewedPage}
