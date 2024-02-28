const express = require('express')
const bodyParser = require('body-parser');
const { dbConnection } = require('./server');
const cors = require('cors');
const { storeData, getAllData, mostVisitedPage} = require('./controllers/dataController');
const { getUserData } = require('./controllers/userController');
//const { config } = require('./controllers/configController');
const { updateData, user, getUsersData } = require('./controllers/updateController');
const { screenCount, mostViewedPage } = require('./controllers/mostViewed');
const { mostClickedActions } = require('./controllers/mostClicked');

const app = express();
const port = 3000;

//Middleware
app.use(bodyParser.json());
app.use(cors()); 

dbConnection()

// API endpoint to receive user data and click events
app.post('/storeData', storeData);
app.get('/getUserData/:ip', getUserData) 
app.get('/getAllData', getAllData);
app.get('/mostVisitedPage', mostVisitedPage)
//app.post('/getConfig',config)
//app.post('/generateUniqueIdentifier',anonymousUser)

//new development api
app.post('/config', user) 
app.post('/updateUserEvents/:userId', updateData)  
app.get('/getUsersData', getUsersData)


//admin page charts data collection api
app.get('/screenCount', screenCount)
app.get('/mostViewedPage', mostViewedPage)
app.get('/mostClickedActions', mostClickedActions)

//Starting the server
app.listen(port, () => {
  console.log(`Server is running on localhost:${port}`);
});
