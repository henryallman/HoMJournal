// Create a WebSocket

// import the Server functionality from socket.io
const {Server} = require("socket.io")

// Variable to store the WebSocket server
let io;

function createSocketServer(httpServer) {
    io = new Server(httpServer, {
        connectionStateRecovery: {},
    });

    // Turn on the WebSocket
    io.on("connection", (socket) => {
        console.log("A user is connected.");

        // Specify what happens when a user disconnects
        socket.on("disconnect", () => {
            console.log("A user disconnected.");
        });
    });

    

    return io;
}

// Export any functions so they can be used outside this file
module.exports = {createSocketServer};