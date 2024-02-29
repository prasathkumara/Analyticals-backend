const mongoose = require('mongoose');
const User = require('../models/userModel')

//update user events endpoint: '/updateUserEvents/:userId'
const updateData = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const clientPayload = req.body;

    clientPayload.forEach(clientEvent => {
      // Find the existing event with the same date
      const existingEvent = user.userEvents.find(existingEvent => existingEvent.date === clientEvent.date);

      if (existingEvent) {
        // Update existing user event
        Object.keys(clientEvent).forEach(screenKey => {
          if (screenKey !== 'date') {
            if (!existingEvent.screens) {
              existingEvent.screens = {};
            }

            if (!existingEvent.screens[screenKey]) {
              existingEvent.screens[screenKey] = {};
            }

            Object.entries(clientEvent[screenKey]).forEach(([key, value]) => {
              if (existingEvent.screens[screenKey][key]) {
                existingEvent.screens[screenKey][key] += value;
              } else {
                existingEvent.screens[screenKey][key] = value;
              }
            });
          }
        });
      } else {
        // Add new user event
        const newUserEvent = {
          date: clientEvent.date,
          screens: {},
        };

        Object.keys(clientEvent).forEach(screenKey => {
          if (screenKey !== 'date') {
            newUserEvent.screens[screenKey] = { ...clientEvent[screenKey] };
          }
        });

        user.userEvents.push(newUserEvent);
      }
    });

      // Calculate total count for each date and update 'totalCount'
      user.userEvents.forEach(userEvent => {
        let totalCount = 0;
        if (userEvent.screens) {
          Object.keys(userEvent.screens).forEach(screenKey => {
            Object.values(userEvent.screens[screenKey]).forEach(value => {
              totalCount += value;
            });
          });
        }
        userEvent.totalCount = totalCount;
      });

    // Mark the 'userEvents' field as modified
    user.markModified('userEvents');

    try {
      // Save the updated user object
      await user.save();
      //console.log('User saved successfully');
    } catch (error) {
      console.error('Error saving user:', error);
    }

    res.json({ message: 'User events updated successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


//new user with config, endpoint :'/config'
const user = async (req, res) => {
    const userData = req.body;
    const configData = {
        endpoint: 'https://webanalyticals.onrender.com',
        serverUpdateTime: 5000,
        token: '',
    };

    try {
        const response = {
            ...configData,
            _id: undefined, // To exclude _id from the response initially
        };

        const newUser = new User({ ...userData });
        const savedUser = await newUser.save();

        // Update the response with the generated _id
        response._id = savedUser._id;

        res.json(response);
    } catch (error) {
        console.error('Error creating config:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


//get all user data, endpoint : '/getUsersData'
const getUsersData= async(req, res) => {
  try {
    const users = await User.find();

    res.status(200).json(users);
  } catch (err) {
    console.error('Error retrieving data from MongoDB:', err);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = {updateData, user, getUsersData}