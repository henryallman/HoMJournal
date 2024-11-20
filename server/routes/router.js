const express = require("express");
const route = express.Router();

// Delegate all authention to the auth.js router
route.use("/auth", require("./auth"));

module.exports = route;