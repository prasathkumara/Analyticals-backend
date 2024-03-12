const User = require("../models/userModel");

const dateFilter = async (req, res) => {
    try {
        const userId = req.params.userId;
        const userData =await User.findOne({_id:userId});

        if (!userData) {
            return res.status(404).json({ error: 'No data found for the specified _id.' });
        } 
        const userEvents = userData.userEvents;

        if (userEvents.length === 0) {
          return res.status(404).json({ error: 'No user events found for the specified _id.' });
        }
        const allDates = userData.userEvents.map(event => ({ date: event.date }));
        return res.json(allDates);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

const getUserEvents = async(req, res) =>{
    try {
        const userId = req.params.userId;
        const date = req.params.date;
        const userData = await User.findOne({_id:userId});
        if(!userData){
            return res.status(404).json({error:"No data found for the specified _id."})
        }
        const userEvents = userData.userEvents.filter(event =>event.date === date);

        if(userEvents.length > 0){
           return res.json(userEvents[0])
        }
       return res.status(404).json({ error: 'No data found for the specified date.' });
    } catch (error) {
        console.error(error);
      return  res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getweeklyData = async (req, res) => {
    try {
      // Filter data based on user ID
      const userId = req.params.userId;
      function getCurrentFormattedDate() {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0'); // padStart ensures two digits
          const day = String(today.getDate()).padStart(2, '0');
        
          return `${year}-${month}-${day}`;
        }
        
      const date = getCurrentFormattedDate();
  
      // Fetch user data from MongoDB
      const userData = await User.findOne({ _id: userId });
  
      // Check if user data exists and userEvents are available
      if (userData && userData.userEvents.length > 0) {
  
        const getWeekDates = (dateStr) => {
          const date = new Date(dateStr);
          const startOfWeek = new Date(date);
          const endOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          endOfWeek.setDate(date.getDate() + (6 - date.getDay()));
          return { startOfWeek, endOfWeek };
        };
        
          // Get the start and end dates of the current week
          const { startOfWeek, endOfWeek } = getWeekDates(date);
  
          // Filter data for the current week, based on userId and date
          const filteredData = userData.userEvents.filter((event) => {
              const eventDate = new Date(event.date);
              return eventDate >= startOfWeek && eventDate <= endOfWeek;
          });
          return res.json(filteredData);
      } else {
          return res.status(404).json({ error: "User data or user events not found." });
      }
  }catch (error) {
          console.error(error);
        return  res.status(500).json({ error: 'Internal Server Error' });
      }
  };

  const getmonthlyData = async (req, res) => {
    try {
      // Get user ID and date from request parameters
      const userId = req.params.userId; //"65e1835028081b5c2dde04c9"//
      function getCurrentFormattedDate() {
          const today = new Date();
          const year = today.getFullYear();
          // getMonth() returns month from 0 to 11, so add 1 to get the correct month
          const month = String(today.getMonth() + 1).padStart(2, '0'); // padStart ensures two digits
          const day = String(today.getDate()).padStart(2, '0');
        
          return `${year}-${month}-${day}`;
        }
        
      const date = getCurrentFormattedDate(); //"2024-03-11";
  
      // Fetch user data from MongoDB
      const userData = await User.findOne({ _id: userId });
  
      // Check if user data exists and userEvents are available
      if (userData && userData.userEvents.length > 0) {
          // Function to get the start and end dates of the current month
          const getMonthDates = (dateStr) => {
              const date = new Date(dateStr);
              const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
              const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
              return { startOfMonth, endOfMonth };
          };
  
          // Get the start and end dates of the current month
          const { startOfMonth, endOfMonth } = getMonthDates(date)
  
          // Filter data for the current month, based on userId and date
          const filteredData = userData.userEvents.filter((event) => {
              const eventDate = new Date(event.date);
              return eventDate >= startOfMonth && eventDate <= endOfMonth;
          });
  
          return res.json(filteredData);
      } else {
          return res.status(404).json({ error: "User data or user events not found." });
      }
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
  };

module.exports = {dateFilter, getUserEvents, getweeklyData, getmonthlyData}