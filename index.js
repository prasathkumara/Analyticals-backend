const express = require('express')
const bodyParser = require('body-parser');
const { dbConnection } = require('./server');
const cors = require('cors');
const { storeData, getAllData, mostVisitedPage, mostClickedAction} = require('./controllers/dataController');
const { getUserData } = require('./controllers/userController');
const { updateData, user, getUsersData } = require('./controllers/updateController');
const { screenCount, mostViewedPage } = require('./controllers/mostViewed');
const { mostClickedActions } = require('./controllers/mostClicked');
const { mapData, getAllMapData, usersByCountry, accesedCountryCount } = require('./controllers/mapDataController');
const { saveDeviceData, getAllUserDeviceData, mostUsedDevices,  } = require('./controllers/deviceDataController');
const { clientData, getUsersByClientName, MostViewedBrowsers } = require('./controllers/dashboardController');
const { getUserEvents, dateFilter, getweeklyData, getmonthlyData } = require('./controllers/dateController');
const { createQuestions, getQuestions } = require('./controllers/botControllers/bot_questionsController');
const { createOffers, getOffers, clienBotData } = require('./controllers/botControllers/bot_offersContoller');
const { createAnimations, getAnimations } = require('./controllers/botControllers/bot_animationsController');
const { checkedData, getCheckedData } = require('./controllers/botControllers/bot_checkedDataController');
const WebSocket = require('ws');
const http = require('http');
const ClientData = require('./models/botModels/bot_checkedModel');
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
app.get('/accesedCountCountry/:clientName',accesedCountryCount)

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

//Chat-Bot
app.post('/chatBot/questions/:clientName', createQuestions);
app.post('/chatBot/offers/:clientName',createOffers);
app.post('/chatBot/animations/:clientName',createAnimations);
app.post('/chatBot/submitData/:clientName', checkedData)

app.get('/chatBot/getOffers/:clientName', getOffers);
app.get('/chatBot/getQuestions/:clientName', getQuestions);
app.get('/chatBot/getAnimations/:clientName', getAnimations);
app.get('/chatBot/getsubmittedData/:clientName',clienBotData);
app.post('/chatBot/getBotData',getCheckedData);

//Starting the server


const server = http.createServer(app);

const wsServer = new WebSocket.Server({ server });
 
wsServer.on('connection', (ws) => {
  ws.on('message', async (message) => {
      console.log('Received:', message);

      // Parse the received message
      let parsedMessage;
      try {
          parsedMessage = JSON.parse(message);
      } catch (error) {
          ws.send(JSON.stringify({ message: 'Invalid JSON format' }));
          return;
      }

      const { inputs, clientName } = parsedMessage;

      if (!inputs || !clientName) {
          ws.send(JSON.stringify({ message: 'Missing inputs or clientName' }));
          return;
      }

      try {
          const clientData = await ClientData.findOne({ clientName }, { _id: false });
          if (!clientData) {
              ws.send(JSON.stringify({ message: `Client data not found for ${clientName}` }));
              return;
          }

          const questions = [];
          const offers = [];

          inputs.forEach(input => {
              const words = input.toLowerCase().split(/\s+/);
              let hasGreeting = false;
              let hasOffer = false;

              words.forEach(word => {
                  if (word === 'hi' || word === 'hello' || word === 'hey') {
                      hasGreeting = true;
                  }
                  if (word === 'offer' || word.includes('offer')) {
                      hasOffer = true;
                  }
              });

              if (hasOffer && clientData.offers && clientData.offers.length > 0) {
                  offers.push(...clientData.offers.map(o => ({ offer: o.offer, link : o.link })));
              } else if (hasGreeting && clientData.questions && clientData.questions.length > 0) {
                  questions.push(...clientData.questions.map(q => ({ question: q.question })));
              }
          });

          if (questions.length === 0 && offers.length === 0) {
              ws.send(JSON.stringify({ message: "Client has no data" }));
              return;
          }

          const responseData = {};
          if (offers.length > 0) {
              responseData.offers = offers;
          } else if (questions.length > 0) {
              responseData.questions = questions;
          }

          ws.send(JSON.stringify(responseData));
      } catch (error) {
          console.error(`Error retrieving client data for ${clientName}:`, error);
          ws.send(JSON.stringify({ message: 'Internal Server Error' }));
      }
  });
});
 
//Starting the server
server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});