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

// Load environment variables from the .env file
const dotenv = require("dotenv");
dotenv.config({path: ".env"});

// Connect to the database
const connectDB = require("./server/database/connection");
connectDB();

// Import the express-session module, which can manage sessions
const session = require('express-session');
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

// Add middleware to handle JSON in HTTP request bodies
app.use(express.json());

// Set the template engine to EJS
app.set("view engine", "ejs");

// Load assets
app.use("/css", express.static("assets/css"));
app.use("/img", express.static("assets/img"));
app.use("/js", express.static("assets/js"));

// Start the server on port 8080
server.listen(8080, () => {
    console.log("The server is listening on localhost:8080");
});