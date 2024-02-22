const express = require('express')
const bodyParser = require('body-parser');
const { dbConnection } = require('./server');
const cors = require('cors');
const { storeData, getAllData} = require('./controllers/dataController');
const { getUserData } = require('./controllers/userController');
//const { config } = require('./controllers/configController');
const { updateData, user } = require('./controllers/updateController');

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
//app.post('/getConfig',config)
//app.post('/generateUniqueIdentifier',anonymousUser)

//new development
app.put('/updateUserEvents/:userId', updateData)  
app.post('/config', user)  

//Starting the server
app.listen(port, () => {
  console.log(`Server is running on localhost:${port}`);
});
