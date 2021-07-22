"use strict";

const http       = require('http');
const mongoose   = require('mongoose');

const app        = require('./src/app');
const config     = require('./src/config');

// Set the port to the API.
app.set('port', config.port);

// Create a http server based on Express
const server = http.createServer(app);

// Attach chat server to http server
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
    },
});
require("./src/chatServer")(io);

//Connect to the MongoDB database; then start the server
mongoose
    .connect(config.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    .then(() => server.listen(config.port))
    .catch(err => {
        console.log('Error connecting to the database', err.message);
        process.exit(err.statusCode);
    });


server.on('listening', () => {
    console.log(`API is running in port ${config.port}`);
});

server.on('error', (err) => {
    console.log('Error in the server', err.message);
    process.exit(err.statusCode);
});
