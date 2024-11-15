/**
 * main Javascript file for the application
 *  this file is executed by the Node server
 */

// Import the http module, which provides an HTTP server
const http = require("http");

// Import the express module, which provides the express function
const express = require("express");

// Create an Express application with an HTTP server
const app = express();
const server = http.createServer(app);

// Create a new WebSocket server object using our created function
const {createSocketServer} = require("./server/socket/socket");
createSocketServer(server);

// Start the server on port 8080
server.listen(8080, () => {
    console.log("The server is listening on localhost:8080");
});