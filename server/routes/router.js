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

route.get("/createEntry", (req, res) => {
    // Send the HoM object to the createEntry view
    res.render("createEntry", {habits: habitsOfMind})
});

// Handle the POST request for creating new entries
route.post("/createEntry", async (req, res) => {
    const entry = new Entry({
        date: req.body.date,
        email: req.session.email,
        habit: req.body.habit,
        content: req.body.content,
    });

    // Save the new entry to the MongoDB database
    await entry.save();

    // Send this new entry to all connected clients
    emitNewEntry({
        id: entry._id,
        date: entry.date.toLocaleDateString(),
        habit: entry.habit,
        content: entry.content.slice(0, 20) + "...",
    });

    // Send a response of "ok"
    res.status(201).end()
});

// Edit an entry with the id given as a parameter
// Currently this just logs the entry to be edited
route.get("/editEntry/:id", async (req, res) => {
    const entry = await Entry.findById(req.params.id);
    console.log(entry);
    res.send(entry);
});

// Delegate all authentication to the auth.js router
route.use("/auth", require("./auth"));



module.exports = route;