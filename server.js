// Dependencies
// =============================================================
const express = require("express");
const path = require("path");
const fs = require("fs");

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Fixes MIME type error when attempting to load CSS 
app.use(express.static('public'))

// Routes
// =============================================================

// Basic route that sends the user to index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// Basic route that sends the user to notes.html
app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "public/notes.html"));
});

// Basic route that sends the db.json file 
app.get("/api/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "/db/db.json"));
});

// Adds new post to db.json in the form of an object with key of "title" and "text"
// Needs to grab the db.json first, push to the array of objects, then send the edited db.json back
app.post("/api/notes", (req, res) => {
    fs.readFile(path.join(__dirname, "/db/db.json"), "utf8", (err, data) => {
        if (err) throw err;
        //console.log(data); //Requested data that new object will be pushed to

        //console.log(req.body); //The new data to be pushed to db.json

        const jsonFile = JSON.parse(data);

        //Generate new ID w/o using jsonFile.length, ID might repeat upon delete
        const newID = jsonFile[jsonFile.length-1].id + 1;

        const newEntry = {
            id: newID,
            title: req.body.title,
            text: req.body.text
        };
        jsonFile.push(newEntry);
        // Adds res.json() to refresh list when adding to db.json
        res.json(newEntry);
        fs.writeFile(path.join(__dirname, "/db/db.json"), JSON.stringify(jsonFile, null, 2), (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
    })
});

// Delete a post from db.json
app.delete("/api/notes/:id", (req, res) => {
    // req.params.id Grabs ID of note that is clicked
    const deleteNote = req.params.id;
    fs.readFile(path.join(__dirname, "/db/db.json"), "utf8", (err, data) => {
        if (err) throw err;

        // Changed const to let because file needed to be changed
        let jsonFile = JSON.parse(data);

        jsonFile = jsonFile.filter((note) => {
            // Added parseInt because file read from JSON is string
            return parseInt(note.id) !== parseInt(deleteNote);
        });

        // Moved JSON.stringify out of writeFile to here to utilize res.json
        const newNote = JSON.stringify(jsonFile, null, 2);
        res.json(newNote);
    
        fs.writeFile(path.join(__dirname, "/db/db.json"), newNote, (err) => {
            if (err) throw err;
            console.log('A Note has been deleted');
        });
    })
});

// Starts the server to begin listening
// =============================================================
app.listen(PORT, () => {
    console.log("App listening on PORT " + PORT);
});