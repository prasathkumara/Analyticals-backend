const express = require("express");
const bodyParser = require("body-parser");
const { dbConnection } = require("./server");
const cors = require("cors");
const {
  createQuestions,
  getQuestions,
} = require("./controllers/botControllers/bot_questionsController");
const {
  createOffers,
  getOffers,
  clienBotData,
} = require("./controllers/botControllers/bot_offersContoller");
const {
  createAnimations,
  getAnimations,
  submitAnimationData,
} = require("./controllers/botControllers/bot_animationsController");
const {
  checkedData,
  getCheckedData,
  getSubmittedClientData,
} = require("./controllers/botControllers/bot_checkedDataController");
const { storeData } = require('./controllers/dataController');
const { saveDeviceData } = require('./controllers/deviceDataController');
const { mapData } = require('./controllers/mapDataController');
const { user, updateData } = require('./controllers/updateController');
const DeviceData = require("./models/deviceData");
const User = require("./models/userModel");
const MapData = require("./models/mapData");

const http = require("http");
const { Server } = require("socket.io");

const WebSocket = require("ws");
const ClientData = require("./models/botModels/bot_checkedModel");
const app = express();
const port = 5000;

const allowedOrigins = ["http://localhost:4200"];

//Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

//Database connection
dbConnection();

app.post('/saveDeviceData',saveDeviceData)
app.post('/saveMapData',mapData)
app.post('/config', user) 
app.post('/updateUserEvents/:userId', updateData)  
app.post('/storeData', storeData);

//Chat-Bot
app.post("/chatBot/questions/:clientName", createQuestions);
app.post("/chatBot/offers/:clientName", createOffers);
app.post("/chatBot/animations/:clientName", createAnimations);
app.post("/chatBot/submitData/:clientName", checkedData);

app.get("/chatBot/getOffers/:clientName", getOffers);
app.get("/chatBot/getQuestions/:clientName", getQuestions);
app.get("/chatBot/getAnimations/:clientName", getAnimations);
app.get("/chatBot/getClientData/:clientName", clienBotData);
app.get("/chatBot/getSubmittedAnimation/:clientName", submitAnimationData);
app.get("/chatBot/getSubmittedData/:clientName", getSubmittedClientData);
app.post("/chatBot/getBotData", getCheckedData);

//Starting the server

const server = http.createServer(app);

const wsServer = new WebSocket.Server({ server });


// Create Socket.IO server with CORS options
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(socket.id);

  let clientname = "web_analytics_gp";
  let insightsClientName = "web_analytics_gp";

  const calculateMostViewedPages = (data) => {
    const screenCounts = {};
    let totalCount = 0;

    data.forEach((item) => {
      if (item.userEvents) {
        item.userEvents.forEach((event) => {
          if (event.screens) {
            Object.entries(event.screens).forEach(([screen, counts]) => {
              if (!screenCounts[screen]) {
                screenCounts[screen] = 0;
              }

              Object.values(counts).forEach((count) => {
                if (typeof count === "number") {
                  screenCounts[screen] += count;
                  totalCount += count;
                }
              });
            });
          }
        });
      }
    });

    const mostViewedPages = Object.keys(screenCounts).map((screen) => ({
      pageName: screen,
      percentage: ((screenCounts[screen] / totalCount) * 100).toFixed(2),
    }));

    mostViewedPages.sort((a, b) => b.percentage - a.percentage);

    return mostViewedPages;
  };

  const calculateCountryCounts = (data) => {
    const countryCounts = {};
    data.forEach((item) => {
      if (countryCounts[item.country]) {
        countryCounts[item.country]++;
      } else {
        countryCounts[item.country] = 1;
      }
    });

    const sortedCountries = Object.keys(countryCounts).sort(
      (a, b) => countryCounts[b] - countryCounts[a]
    );
    return sortedCountries.slice(0, 3).map((country, index) => ({
      label: country,
      id: `file${index + 1}`,
      value: countryCounts[country],
    }));
  };

  const calculateButtonCounts = (data) => {
    const buttonCounts = {};
    data.forEach((item) => {
      if (item.userEvents) {
        item.userEvents.forEach((event) => {
          if (event.screens) {
            Object.values(event.screens).forEach((screen) => {
              Object.entries(screen).forEach(([button, count]) => {
                if (!buttonCounts[button]) {
                  buttonCounts[button] = 0;
                }
                buttonCounts[button] += count;
              });
            });
          }
        });
      }
    });

    const sortedButtons = Object.keys(buttonCounts).sort(
      (a, b) => buttonCounts[b] - buttonCounts[a]
    );

    return sortedButtons.map((button) => ({
      ButtonName: button,
      count: buttonCounts[button],
    }));
  };

  //         SendAggregatedDAta function starts
  const sendAggregatedData = () => {
    User.find({ "userInfo.clientName": clientname })
      .then((data) => {
        socket.emit("mostViewedPage", calculateMostViewedPages(data));
        socket.emit("mostViewedPageTable", calculateMostViewedPages(data));
        socket.emit("mostClicked", calculateButtonCounts(data));
        socket.emit("mostClickedTable", calculateButtonCounts(data));
      })
      .catch((err) => console.log(err));

    DeviceData.aggregate([
      { $match: { clientName: clientname } },
      { $group: { _id: "$DeviceName", count: { $sum: 1 } } },
      { $project: { DeviceName: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]).then((data) => {
      socket.emit("DeviceData", data), socket.emit("DeviceDataTable", data);
    });

    MapData.aggregate([
      { $match: { clientName: clientname } },
      {
        $group: {
          _id: { country: "$country", city: "$cityName" },
          users: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          cityName: "$_id.city",
          users: 1,
          country: "$_id.country",
        },
      },
    ]).then((data) => {
      socket.emit("MostUsedCountries", data),
        socket.emit("MostUsedCountriesTable", data);
    });

    User.aggregate([
      { $match: { "userInfo.clientName": clientname } },
      { $group: { _id: "$userInfo.browserName", count: { $sum: 1 } } },
      { $project: { _id: 0, browserName: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]).then((data) => {
      socket.emit("browserCounts", data),
        socket.emit("browserCountsTable", data);
    });

    MapData.find({ clientName: clientname }).then((data) => {
      socket.emit("CountryCounts", calculateCountryCounts(data));
    });
  };

  sendAggregatedData();

  socket.on("clientName", (data) => {
    clientname = data;
    sendAggregatedData();
  });

  socket.on("clientNameTable", (data) => {
    clientname = data;
    sendAggregatedData();
  });

  //insights user id

  socket.on("insightsClientName", (data) => {
    insightsClientName = data;

    async function getUserIds(insightsClientName) {
      try {
        const users = await User.find(
          { "userInfo.clientName": insightsClientName },
          "_id"
        );

        const userIds = users.map((user) => ({ _id: user._id }));

        socket.emit("InsightsUserId", userIds);
      } catch (error) {
        console.error("Error fetching user IDs:", error);
      }
    }
    getUserIds(insightsClientName);
  });

  //  insights clientNames

  function emitClientNames(socket) {
    User.find()
      .then((data) => {
        const clientNames = data
          .filter((user) => user.userInfo && user.userInfo.clientName)
          .map((user) => user.userInfo.clientName);

        const uniqueClientNames = [...new Set(clientNames)];

        socket.emit("ClientNamesInsights", uniqueClientNames);
        socket.emit("ClientNamesOverview", uniqueClientNames);
      })
      .catch((err) => console.log(err));
  }

  socket.on("activeTab", (data) => {
    if (data === true) {
      emitClientNames(socket);
      sendAggregatedData();
    }
  });

  // userId

  const getWeeklyData = async (userName, socket) => {
    function getCurrentFormattedDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    const date = getCurrentFormattedDate();

    const userData = await User.findOne({ _id: userName });

    if (userData && userData.userEvents.length > 0) {
      const getWeekDates = (dateStr) => {
        const date = new Date(dateStr);
        const startOfWeek = new Date(date);
        const endOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        endOfWeek.setDate(date.getDate() + (6 - date.getDay()));
        return { startOfWeek, endOfWeek };
      };

      const { startOfWeek, endOfWeek } = getWeekDates(date);

      const filteredData = userData.userEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      });

      if (filteredData.length > 0) {
        socket.emit("weeklyData", filteredData);
      } else {
        socket.emit("weeklyDataError", {
          error: "No user data found for current week",
        });
      }
    }
  };

  const getMonthlyData = async (userId, socket) => {
    function getCurrentFormattedDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    const date = getCurrentFormattedDate();

    const userData = await User.findOne({ _id: userId });

    if (userData && userData.userEvents.length > 0) {
      const getMonthDates = (dateStr) => {
        const date = new Date(dateStr);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return { startOfMonth, endOfMonth };
      };

      const { startOfMonth, endOfMonth } = getMonthDates(date);

      const filteredData = userData.userEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
      });

      if (filteredData.length) {
        socket.emit("monthlyData", filteredData);
      } else {
        socket.emit("monthlyDataError", {
          
          error: "No user data found for current month",
        });
      }
    }
  };

  const getUserEvents = async (userId, date, socket) => {
    try {
      const userData = await User.findOne({ _id: userId });

      if (!userData) {
        socket.emit("userEventsError", {
          error: "No data found for the specified _id.",
        });
        return;
      }
      const userEvents = userData.userEvents.filter(
        (event) => event.date === date
      );

      if (userEvents.length > 0) {
        socket.emit("userEvents", userEvents[0]);
      } else {
        socket.emit("userEventsError", {
          error: "No data found for the specified date.",
        });
      }
    } catch (error) {
      socket.emit("userEventsError", { error: "Internal Server Error" });
    }
  };

  const changeStream = User.watch();

  changeStream.on("change", (change) => {
    const userId = change.documentKey._id;
    User.findOne({ _id: userId })
      .then((userData) => {
        if (!userData) return;
        const userEvents = userData.userEvents;
        socket.emit("userEvents", userEvents);
      })
      .catch((err) => {
        console.error("Error fetching updated user data:", err);
      });
  });

  socket.on("getUserEvents", (data) => {
    const { userId, date } = data;
    getUserEvents(userId, date, socket);
  });

  socket.on("insightsSelectedUserMonthly", (userId) => {
    getMonthlyData(userId, socket);
  });

  socket.on("insightsSelectedUser", (data) => {
    getWeeklyData(data, socket);
  });

  const watchCollections = (watcher, handler) => {
    watcher.on("change", (change) => {
      if (change.operationType === "update") {
        const updatedDocumentId = change.documentKey._id;
        getWeeklyData(updatedDocumentId, socket);
        getMonthlyData(updatedDocumentId, socket);
      }
      handler(change);
    });
  };

  watchCollections(User.watch(), () => sendAggregatedData());
  watchCollections(MapData.watch(), () => sendAggregatedData());
  watchCollections(DeviceData.watch(), () => sendAggregatedData());
});

wsServer.on("connection", (ws) => {
  ws.on("message", async (message) => {
    console.log("Received:", message);

    // Parse the received message
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch (error) {
      ws.send(JSON.stringify({ message: "Invalid JSON format" }));
      return;
    }

    const { inputs, clientName } = parsedMessage;

    if (!inputs || !clientName) {
      ws.send(JSON.stringify({ message: "Missing inputs or clientName" }));
      return;
    }

    try {
      const clientData = await ClientData.findOne(
        { clientName },
        { _id: false }
      );
      if (!clientData) {
        ws.send(
          JSON.stringify({ message: `Client data not found for ${clientName}` })
        );
        return;
      }

      const questions = [];
      const offers = [];

      inputs.forEach((input) => {
        const words = input.toLowerCase().split(/\s+/);
        let hasGreeting = false;
        let hasOffer = false;

        words.forEach((word) => {
          if (word === "hi" || word === "hello" || word === "hey") {
            hasGreeting = true;
          }
          if (word === "offer" || word.includes("offer")) {
            hasOffer = true;
          }
        });

        if (hasOffer && clientData.offers && clientData.offers.length > 0) {
          offers.push(
            ...clientData.offers.map((o) => ({ offer: o.offer, link: o.link }))
          );
        } else if (
          hasGreeting &&
          clientData.questions &&
          clientData.questions.length > 0
        ) {
          questions.push(
            ...clientData.questions.map((q) => ({ question: q.question }))
          );
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
      ws.send(JSON.stringify({ message: "Internal Server Error" }));
    }
  });
});

//Starting the server
server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
