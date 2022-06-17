// hosting specifics
const path = require('path');

// Server reqs
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer,{});


let PORT = process.env.PORT;
if (PORT == null || PORT == "") {
    PORT = 3000;
};



// Use things in public folder
app.use(express.static('public'));

// serve HTML
app.get('/', (req, res) => {
 // Serve HTML
    res.sendFile(path.join(__dirname, 'index.html'));
});

httpServer.listen(PORT, function() {
    console.log('listening on ' + PORT);
});

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
        // console.log("conductor says: " + arg);
        io.sockets.emit('serverSays', arg); // io.sockets to send to all connected clients
    });

    // Rehearsal Mark specific listener
    socket.on("conductorRehearsalMark", (arg, callback) => {
        // console.log("conductor rehearsal mark: " + arg);
        io.sockets.emit('serverRehearsalMark', arg); // io.sockets to send to all connected clients
    });
});

