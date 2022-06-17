// Utilities
const path = require('path');
const os = require('os');
let networkInterfaces = os.networkInterfaces();

// hosting specifics
const compression = require('compression');

// Server reqs
const express = require('express');
const http = require('http');
const serverIp = os.networkInterfaces()['en0'][1]['address'];
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const { Server, Socket } = require('socket.io');
const io = new Server(server, {cors: {origin: serverIp + ':' + PORT}}); // mime type work around



/////////////////////////
// Express Server Code //
/////////////////////////

//Compress all routes
app.use(compression());

// Use things in public folder
app.use(express.static('public'))

// serve HTML
app.get('/', (req, res) => {
 // Serve HTML
    res.sendFile(path.join(__dirname, 'index.html'));
})

server.listen(PORT, function() {
    console.log('listening http://localhost:' + PORT);
    console.log('listening ' + serverIp + ':' + PORT);
})

//////////////////
// Socket.io    //
//////////////////
    // parse messages
io.on('connection', (socket) => {
    console.log(socket.id + ' connected');
    console.log(io.of("/").sockets.size + " users connected");

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    /////////////////////////////////////////////
    // anDoor Specific listeners and callbacks //
    /////////////////////////////////////////////

    // messages from clients with "conductorSays" passes request to all clients including sender
   socket.on("conductorSays", (arg, callback) => {
        console.log("conductor says: " + arg);
        io.sockets.emit('serverSays', arg); // io.sockets to send to all connected clients
    });

    // Rehearsal Mark specific listener
    socket.on("conductorRehearsalMark", (arg, callback) => {
        console.log("conductor rehearsal mark: " + arg);
        io.sockets.emit('serverRehearsalMark', arg); // io.sockets to send to all connected clients
    });
});

