
const
    http = require("http"),
    express = require("express"),
    socketio = require("socket.io");
    

const SERVER_PORT = 3000;


const {gridParkStreets} = require("./griddata");

let nextVisitorNumber = 1;
let data = gridParkStreets


function onNewWebsocketConnection(socket) {
    console.info(`Socket ${socket.id} has connected.`);
    if (data.length > 0){
      socket.emit("newdatafromserver", data);
    }   
    socket.on("disconnect", () => {
        console.info(`Socket ${socket.id} has disconnected.`);
    });

    // echoes on the terminal every "hello" message this socket sends
    socket.on("hello", helloMsg => console.info(`Socket ${socket.id} says: "${helloMsg}"`));

    // will send a message only to this socket (different than using `io.emit()`, which would broadcast it)
    socket.emit("welcome", `Welcome! You are visitor number ${nextVisitorNumber++}`);
}

function startServer() {
    // create a new express app
    const app = express();
    app.use(express.json());
    // create http server and wrap the express app
    const server = http.createServer(app);
    // bind socket.io to that server
    const io = socketio(server);

    // example on how to serve a simple API
    app.post("/newdata", (req, res) => {
      data = req.body
      console.log("**** newdata", data[0])
      io.emit("newdatafromserver", data);
      
    });

    // example on how to serve static files from a given folder
    app.use(express.static("public"));

    // will fire for every new websocket connection
    io.on("connection", onNewWebsocketConnection);

    // important! must listen from `server`, not `app`, otherwise socket.io won't function correctly
    server.listen(SERVER_PORT, () => console.info(`Listening on port ${SERVER_PORT}.`));

    // will send one message per second to all its clients
    let secondsSinceServerStarted = 0;
    setInterval(() => {
        secondsSinceServerStarted++;
        io.emit("seconds", secondsSinceServerStarted);
    }, 1000);
}

startServer();
