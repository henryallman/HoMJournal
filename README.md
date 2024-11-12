# Habits of Mind Journal App Lab

## Introduction

The goal of this lab is to apply your understanding of JavaScript, HTML, CSS, Mongo, and Node.js developed through the unit to add additional features to the Habits of Mind Journal app.

## General Requirements

- use GitHub best practices (e.g., frequently and meaningful commit messages, branches for each feature, pull requests)

## Feature Requirements

- finish the edit entry feature
  - add code to render EJS file for the editEntry endpoint
  - update entry in MongoDB using Mongoose
- implement delete entry feature
  - add delete button to bottom of the editEntry page
  - add route for deleteEntry (similar to editEntry post handler)
  - delete entry in MongoDB using Mongoose
  - _extension: add popup confirmation or undo feature_
- sort entries on index page by date (descending)
  - implement on server side before rendering EJS file
- implement filter entries feature
  - add filter text box (or drop down) and filter button to top of the index page to filter entries by Habit of Mind
  - research and use HTTP query parameter to pass filter text to index route
  - implement filtering on server side before rendering EJS file
  - _extension: filter on the MongoDB server to minimize the amount of data transferred_

## Extensions

- export all entries to CSV file or display tab-delimited on screen
- improve UI design of web app
- add more awesome

## Submission

- Submit a link to your GitHub repository from GitHub Classroom.
