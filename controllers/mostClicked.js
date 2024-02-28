const MostClickedActions = require("../models/mostClickedActions");
const User = require("../models/userModel");


const mostClickedActions = async (req, res) => {
    try {
      const users = await User.find();
      // Check if there is an existing document in the "mostviewedpage" collection
      const existingMostViewedPage = await MostClickedActions.findOne();
  
      // Function to calculate the most clicked screen
      const getMostClickedButtons = (data) => {
        const buttonCounts = {};
      
        // Iterate through the data to calculate counts for each button
        data.forEach(item => {
          if (item.userEvents) {
            item.userEvents.forEach(event => {
              if (event.screens) {
                Object.values(event.screens).forEach(screen => {
                  Object.entries(screen).forEach(([button, count]) => {
                    if (!buttonCounts[button]) {
                      buttonCounts[button] = 0;
                    }
                    buttonCounts[button] += count;
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
      
      // Call the function to get the most clicked buttons
      const result = getMostClickedButtons(users);
      console.log(result);
      
      // If there is an existing document, update it; otherwise, create a new one
      if (existingMostViewedPage) {
        await MostClickedActions.updateOne({}, result);
      } else {
        const mostViewedPage = new MostClickedActions(result);
        await mostViewedPage.save();
      }
  
      res.json(result);
    } catch (error) {
      console.error('Error processing most viewed page data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  module.exports = {mostClickedActions}