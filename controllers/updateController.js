
const mongoose = require('mongoose');
const User = require('../models/userModel')


const updateData = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        console.log("User---->", user)

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const clientPayload = req.body;
        console.log('payload',clientPayload);

        // Update userEvents based on the client payload
        clientPayload.forEach(clientEvent => {
            const existingEvent = user.userEvents.find(existingEvent => existingEvent.date === clientEvent.date);
            //console.log('1.index', existingEventIndex);
            if (existingEvent) {
                // Update existing user event
               
                
                console.log('2.existingevent---', existingEvent);

                const screenKey = Object.keys(clientEvent)[1]; // Assuming screen1 is always at index 1
                console.log("3.screenKey", screenKey);

                if (!existingEvent[screenKey]) {
                    existingEvent[screenKey] = {};
                }

                const existingScreen = existingEvent[screenKey];
                console.log("4.existingScreen--->", existingScreen);
                Object.entries(clientEvent[screenKey]).forEach(([key, value]) => {
                    if (existingScreen[key]) {
                        console.log("5.Existingkey-->", existingScreen[key]);
                        console.log("6.value", value);
                        existingScreen[key] += value;
                        console.log("7. Updated Existingkey-->", existingScreen[key]);

                    } else {
                        existingScreen[key] = value;
                        console.log("9");
                    }
                });

                // Calculate totalCount by summing counts of all keys within the screen
                existingEvent.totalCount = Object.values(existingScreen).reduce((sum, value) => sum + value, 0);
                console.log('10. total count -->', existingEvent.totalCount)
              
            } else {
                // Add new user event
                user.userEvents.push({
                    date: clientEvent.date,
                    [Object.keys(clientEvent)[1]]: clientEvent[Object.keys(clientEvent)[1]],
                    // Calculate totalCount by summing counts of all keys within the screen
                    totalCount: Object.values(clientEvent[Object.keys(clientEvent)[1]]).reduce((sum, value) => sum + value, 0)
                });
            }
        });

        user.markModified('userEvents');

        try {
            await user.save();
            console.log('User saved successfully');
        } catch (error) {
            console.error('Error saving user:', error);
        }

        res.json({ message: 'User events updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const user = async (req, res) => {
        const userData = req.body;
        const configData = {
            endpoint: 'https://webanalyticals.onrender.com',
            serverUpdateTime: 5000,
            token: '',
        };
        try {
          
            const response = {
                ...userData,
                ...configData,
              };

              const newUser = new User(response);
              const  savedUser =  await newUser.save();
              res.json( savedUser );
        } catch (error) {
            console.error('Error craeting config:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
};

module.exports = {updateData, user}