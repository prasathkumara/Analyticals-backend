const mongoose = require('mongoose');

const userEventSchema = new mongoose.Schema({
    date: String,
    screens: Object,
    totalCount: Number

}, { strict: false, _id: false });

const userInfoSchema = new mongoose.Schema({
    ip: String,
    browserName: String,
    clientName: String,
    userType : String,
    dates: String,
    time: String,
    lat : String,
    lan : String,
    country : String,
    device : String
}, { _id: false, strict: false});

const userSchema = new mongoose.Schema({
    
    userInfo: userInfoSchema,
    userEvents: [userEventSchema]
},{ strict: false });


// Create a mongoose model
const User = mongoose.model('User', userSchema);

module.exports = User;
