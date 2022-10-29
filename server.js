const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const PORT = process.env.PORT || 3001;

// Helper method for generating unique ids
const uId = require('./public/assets/uId');

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// GET Route for homepage
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/index.html'))
);
app.use(express.static('api'));

// GET Route for notes page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/notes.html'))
);

// GET Route for retrieving all saved notes
const readFromFile = util.promisify(fs.readFile);
app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received for get notes from json`);
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});


// readAndAppend function
const readAndAppend = (content, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

// writeToFile function
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );


// POST Route for saving notes into db.json
app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request received to save notes`);
  const { title, text } = req.body;
  if (title && text) {
    const newNote = {
      title,
      text,
      id: uId(),
    };

    readAndAppend(newNote, './db/db.json');

    const response = {
      status: 'success',
      body: newNote,
    };

    res.json(response);
  } else {
    res.json('Error in saving new notes');
  }
});

app.delete('/api/notes/:id', (req, res) => {
  res.send('Got a DELETE request')
   // user.del(req.params.id);
  });


app.get('/*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
