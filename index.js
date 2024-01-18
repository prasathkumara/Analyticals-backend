const express = require('express')
const bodyParser = require('body-parser');
const { dbConnection } = require('./server');
const cors = require('cors');
const { storeData } = require('./controllers/dataController');
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

  app.get('/getAllData', async (req, res) => {
    try {
      const db = await dbConnection();
  
      // Retrieve all data from MongoDB using Mongoose
      const allData = await db.collection('userEvents').find({}).toArray();
  
      res.status(200).json(allData);
    } catch (err) {
      console.error('Error retrieving data from MongoDB:', err);
      res.status(500).send('Internal Server Error');
    }
  });
    

//Starting the server
app.listen(port, () => {
  console.log(`Server is running on localhost:${port}`);
});
