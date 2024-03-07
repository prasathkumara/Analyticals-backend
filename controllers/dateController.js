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

module.exports = {dateFilter, getUserEvents}