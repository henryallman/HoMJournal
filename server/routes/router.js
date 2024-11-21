const express = require("express");
const route = express.Router();
const Entry = require("../model/entry");
// Just importing emitNewEntry from socket
const {emitNewEntry} = require("../socket/socket");

// JSON is an easy way to store static data
const habitsOfMind = require("../model/habitsOfMind.json");

// Pass a path ("/") and callback function => {}
// When the client makes at HTTP GET request to this path
// the callback function is executed
route.get("/", async (req, res) => {
    // You can use console.log to test if functions are being called
    console.log("Path Requested: "+req.path);

    // The await keyword pauses the function until the line is done
    const entries = await Entry.find();
    
    // Convert MongoDB objects to objects formatted for EJS
    const formattedEntries = entries.map((entry) => {
        return {
            id: entry._id,
            date: entry.date.toLocaleDateString(),
            habit: entry.habit,
            content: entry.content.slice(0, 20) + "...",
        };
    });

    // The res parameter references the HTTP response object
    res.render("index", {entries: formattedEntries});
});

// Delegate all authentication to the auth.js router
route.use("/auth", require("./auth"));



module.exports = route;