const express = require('express')
const bodyParser = require('body-parser');
const { dbConnection } = require('./server');
const cors = require('cors');
const { storeData, getAllData, mostVisitedPage, mostClickedAction} = require('./controllers/dataController');
const { getUserData } = require('./controllers/userController');
const { updateData, user, getUsersData } = require('./controllers/updateController');
const { screenCount, mostViewedPage } = require('./controllers/mostViewed');
const { mostClickedActions } = require('./controllers/mostClicked');
const { mapData, getAllMapData, usersByCountry } = require('./controllers/mapDataController');
const { saveDeviceData, getAllUserDeviceData, mostUsedDevices,  } = require('./controllers/deviceDataController');
const { clientData, getUsersByClientName, MostViewedBrowsers } = require('./controllers/dashboardController');
const { getUserEvents, dateFilter, getweeklyData, getmonthlyData } = require('./controllers/dateController');

const app = express();
const port = 3000;

//Middleware
app.use(bodyParser.json());
app.use(cors()); 

//Database connection
dbConnection()

// API endpoint to receive user data and click events
app.post('/storeData', storeData);
app.get('/getUserData/:ip', getUserData) 
app.get('/getAllData', getAllData);

//admin page charts data collection api old json structure
app.get('/mostVisitedPage', mostVisitedPage)
app.get('/mostClicked', mostClickedAction)

//new development api
app.post('/config', user) 
app.post('/updateUserEvents/:userId', updateData)  
app.get('/getUsersData', getUsersData)

//admin page charts data collection api
app.get('/screenCount', screenCount)
app.get('/mostViewedPages/:clientName', mostViewedPage)
app.get('/mostClickedActions/:clientName', mostClickedActions)
app.get('/mostUsedBrowsers/:clientName', MostViewedBrowsers)
app.get('/mostUsedDevices/:clientName', mostUsedDevices)
app.get('/usersByCountry/:clientName', usersByCountry)

//new development
app.post('/saveMapData',mapData)
app.get('/getAllMapData/:clientName', getAllMapData)

app.post('/saveDeviceData',saveDeviceData)
app.get('/getAllDeviceData/:clientName', getAllUserDeviceData)
  
app.get('/getAllClients',clientData);
app.get('/getUsersByClientName/:clientName', getUsersByClientName)

//date  
app.get('/getDates/:userId', dateFilter)
app.get('/getUserEvents/:userId/:date', getUserEvents)
app.get('/getWeeklyData/:userId', getweeklyData)
app.get('/getMonthlyData/:userId', getmonthlyData)

//Starting the server
app.listen(port, () => {
  console.log(`Server is running on localhost:${port}`);
});
