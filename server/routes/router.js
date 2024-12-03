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
    try {
        // Get the habit filter from query parameters
        const habitFilter = req.query.habit ? { 
            habit: { $regex: new RegExp(req.query.habit, 'i') }  // Case-insensitive search
        } : {};

        // Add email filter to only show user's entries
        const filter = {
            ...habitFilter,
            email: req.session.email
        };

        // Fetch entries with filter, sort by date descending
        let entries = await Entry.find(filter)
            .sort({ date: -1 })  // -1 for descending order
            .lean()  // Convert to plain JavaScript objects
            .exec();

        // Format the dates to MM/DD/YYYY format
        entries = entries.map(entry => ({
            ...entry,
            date: entry.date.toLocaleDateString('en-US')  // Changed this line to use en-US locale
        }));

        // Use static list of all Habits of Mind
        const habits = [
            "Persisting",
            "Managing Impulsivity",
            "Listening with Understanding and Empathy",
            "Thinking Flexibly",
            "Thinking About Thinking (Metacognition)",
            "Striving for Accuracy",
            "Questioning and Problem Posing",
            "Applying Past Knowledge to New Situations",
            "Thinking and Communicating with Clarity and Precision",
            "Gathering Data Through All Senses",
            "Creating, Imagining, Innovating",
            "Responding with Wonderment and Awe",
            "Taking Responsible Risks",
            "Finding Humor",
            "Thinking Interdependently",
            "Remaining Open to Continuous Learning"
        ];

        res.render("index", {
            entries,
            habits,
            currentFilter: req.query.habit || ''
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error fetching entries');
    }
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
        date: entry.date==null ? null :entry.date.toLocaleDateString(),
        habit: entry.habit,
        content: entry.content.slice(0, 20) + "...",
    });

    // Send a response of "ok"
    res.status(201).end()
});

// Edit an entry with the id given as a parameter
route.get("/editEntry/:id", async (req, res) => {
    try {
        // Fetch the entry from database
        const entry = await Entry.findById(req.params.id).lean();
        
        if (!entry) {
            return res.status(404).send('Entry not found');
        }

        // Format the date for the input field (YYYY-MM-DD)
        entry.date = entry.date.toISOString().split('T')[0];

        // Render the editEntry view with the entry data and habits
        res.render('editEntry', { 
            entry: entry,
            habits: habitsOfMind  // Using the habitsOfMind from your existing code
        });
    } catch (err) {
        console.error('Error fetching entry:', err);
        res.status(500).send('Error fetching entry');
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

// Add route for deleting an entry
route.delete("/deleteEntry/:id", async (req, res) => {
    try {
        const entry = await Entry.findByIdAndDelete(req.params.id);
        if (!entry) {
            return res.status(404).send('Entry not found');
        }
        res.status(200).send('Entry deleted successfully');
    } catch (err) {
        console.error('Error deleting entry:', err);
        res.status(500).send(err.message);
    }
});

// Add this new route
route.get("/export", async (req, res) => {
    try {
        // Get entries for the current user
        const entries = await Entry.find({ email: req.session.email })
            .sort({ date: -1 })
            .lean()
            .exec();

        // Format entries for CSV
        const formattedEntries = entries.map(entry => ({
            Date: entry.date.toLocaleDateString('en-US'),
            Habit: entry.habit,
            Content: entry.content
        }));

        // Check if user wants to display on screen
        if (req.query.display === 'screen') {
            return res.render('export', { entries: formattedEntries });
        }

        // Create CSV content
        const csvHeader = ['Date', 'Habit', 'Content'].join(',') + '\n';
        const csvRows = formattedEntries.map(entry => 
            [entry.Date, entry.Habit, `"${entry.Content.replace(/"/g, '""')}"`].join(',')
        ).join('\n');
        const csvContent = csvHeader + csvRows;

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=journal_entries.csv');
        
        // Send the CSV file
        res.send(csvContent);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error exporting entries');
    }
});

module.exports = route;