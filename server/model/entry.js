// Schema for a Journal Entry

const mongoose = require("mongoose");

// Set the fields of the schema
const schema = new mongoose.Schema({
    date : {
        type: Date,
        required: true,
    },
    email : {
        type: String,
        required: true,
    },
    habit : {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
});

// Specify the schema to use in MongoDB
const Entry = mongoose.model("Entry", schema);

module.exports = Entry;