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
    console.log("Path Requested: "+req.path);

    const entries = await Entry.find();
    
    // Convert MongoDB objects to objects formatted for EJS
    const formattedEntries = entries.map((entry) => {
        return {
            id: entry._id,
            date: entry.date ? entry.date.toLocaleDateString() : 'No date',
            habit: entry.habit,
            content: entry.content ? entry.content.slice(0, 20) + "..." : '',
        };
    });

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
route.get("/editEntry/:id", async (req, res) => {
    try {
        const entry = await Entry.findById(req.params.id);
        res.render('editEntry', { 
            habits: habitsOfMind, 
            entry: entry 
        });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Add route for updating an entry
route.put("/updateEntry/:id", async (req, res) => {
    try {
        console.log('Received update request for ID:', req.params.id);
        console.log('Update data:', req.body);

        const entry = await Entry.findByIdAndUpdate(req.params.id, {
            date: req.body.date,
            habit: req.body.habit,
            content: req.body.content
        }, { new: true });
        
        if (!entry) {
            console.log('Entry not found for ID:', req.params.id);
            return res.status(404).send('Entry not found');
        }

        console.log('Entry updated successfully:', entry);
        res.status(200).send('Entry updated successfully');
    } catch (err) {
        console.error('Error updating entry:', err);
        res.status(500).send(err.message);
    }
});

// Delegate all authentication to the auth.js router
route.use("/auth", require("./auth"));

// Get single entry
route.get('/getEntry/:id', async (req, res) => {
    try {
        const entry = await Entry.findById(req.params.id);
        if (!entry) {
            return res.status(404).send('Entry not found');
        }
        res.json(entry);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = route;