const express = require('express')
const bodyParser = require('body-parser');
const { dbConnection } = require('./server');
const cors = require('cors');
const { storeData, getAllData } = require('./controllers/dataController');
const { getUserData } = require('./controllers/userController');


const app = express();
const port = 3000;


//Middleware
app.use(bodyParser.json());
app.use(cors()); 



dbConnection()

  // API endpoint to receive user data and click events
  app.post('/storeData', storeData);
  app.get('/getUserData', getUserData)
  app.get('/getAllData', getAllData);
    

//Starting the server
app.listen(port, () => {
  console.log(`Server is running on localhost:${port}`);
});
