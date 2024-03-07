const express = require('express')
const bodyParser = require('body-parser');
const { dbConnection } = require('./server');
const cors = require('cors');
const { storeData, getAllData, mostVisitedPage, mostClickedAction} = require('./controllers/dataController');
const { getUserData } = require('./controllers/userController');
//const { config } = require('./controllers/configController');
const { updateData, user, getUsersData } = require('./controllers/updateController');
const { screenCount, mostViewedPage } = require('./controllers/mostViewed');
const { mostClickedActions } = require('./controllers/mostClicked');
const { mapData, getAllMapData } = require('./controllers/mapDataController');
const { saveDeviceData, getAllUserDeviceData } = require('./controllers/deviceDataController');
const { clientData, getUsersByClientName } = require('./controllers/dashboardController');
const { getUserEvents, dateFilter } = require('./controllers/dateController');

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

//admin page charts data collection api old json structure
app.get('/mostVisitedPage', mostVisitedPage)
app.get('/mostClicked', mostClickedAction)

//new development api
app.post('/config', user) 
app.post('/updateUserEvents/:userId', updateData)  
app.get('/getUsersData', getUsersData)


//admin page charts data collection api
app.get('/screenCount', screenCount)
app.get('/mostViewedPage', mostViewedPage)
app.get('/mostClickedActions', mostClickedActions)

//new development
app.post('/saveMapData',mapData)
app.get('/getAllMapData', getAllMapData)

app.post('/saveDeviceData',saveDeviceData)
app.get('/getAllDeviceData', getAllUserDeviceData)
  
app.get('/getAllClients',clientData);
app.get('/getUsersByClientName/:clientName', getUsersByClientName)

//date  
app.get('/getDates/:userId', dateFilter)
app.get('/getUserEvents/:userId/:date', getUserEvents)

//Starting the server
app.listen(port, () => {
  console.log(`Server is running on localhost:${port}`);
});
