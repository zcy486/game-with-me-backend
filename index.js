"use strict";

const http       = require('http');
const mongoose   = require('mongoose');

const app        = require('./src/app');
const config     = require('./src/config');

const async = require("async");
const Game = require("./src/models/game");

// Set the port to the API.
app.set('port', config.port);

//Create a http server based on Express
const server = http.createServer(app);

//Connect to the MongoDB database; then start the server
mongoose
    .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
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

//The following part generates test data on games, posts and users.
mongoose.Promise = global.Promise;

Game.deleteMany({}, function (err) {
    if (err) {
        console.log(err);
    }
});

function gameCreate(name, allServers, allPlatforms, isPopular, cb) {
    const gameInfo = {name, allServers, allPlatforms, isPopular};
    const game = new Game(gameInfo);

    game.save(function (err) {
        if(err) {
            cb(err, null);
            return;
        }
        cb(null, game);
    });
}

function createGames(cb) {
    async.parallel([
        function (callback) {
            gameCreate("Apex Legends", ["Europe", "Korea", "Japan", "North America", "South America"], ["PC", "PS4", "Xbox"], false, callback);
        },
        function (callback) {
            gameCreate("Animal Crossing: New Horizons", ["N/A"], ["Switch"], true, callback);
        },
        function (callback) {
            gameCreate("Arena of Valor", ["Europe", "Asia", "North America"], ["Switch", "IOS", "Andriod"], false, callback);
        },
        function (callback) {
            gameCreate("Black Desert Online", ["Europe", "Japan", "Korea", "North America", "SEA"], ["Switch", "IOS", "Andriod"], false, callback);
        },
        function (callback) {
            gameCreate("CS:GO", ["Australia", "Europe", "Japan", "Korea", "US", "Brazil", "Chile", "Poland", "Spain", "China", "Singapore", "India"], ["PC"], false, callback);
        },
        function (callback) {
            gameCreate("Call of Duty", ["US", "Oceania", "Asia", "US"], ["PC", "PS4", "Xbox"], false, callback);
        },
        function (callback) {
            gameCreate("Dota 2", ["US", "Europe", "Asia", "South America", "Russia", "Australia", "South Africa"], ["PC"], false, callback);
        },
        function (callback) {
            gameCreate("Fortnight", ["NA West", "NA East", "Brazil", "Europe", "Asia", "China"], ["PC", "PS4", "Xbox", "Switch"], false, callback);
        },
        function (callback) {
            gameCreate("Grand Theft Auto", ["N/A"], ["PC", "PS5", "PS4", "PS3", "Xbox One", "Xbox 360"], false, callback);
        },
        function (callback) {
            gameCreate("Humans Fall Flat", ["N/A"], ["PC", "PS4", "Xbox", "Switch", "iOS", "Android"], false, callback);
        },
        function (callback) {
            gameCreate("League of Legends", ["OCE", "NA", "LAN", "BR", "EU"], ["PC"], true, callback);
        },
        function (callback) {
            gameCreate("League of Legends", ["OCE", "NA", "LAN", "BR", "EU"], ["PC"], true, callback);
        },
        function (callback) {
            gameCreate("Minecraft", ["International", "Europe", "US", "China"], ["PC", "Switch", "Xbox"], true, callback);
        },
        function (callback) {
            gameCreate("Monster Hunter World", ["N/A"], ["PC", "PS4", "Xbox"], false, callback);
        },
        function (callback) {
            gameCreate("Monster Hunter RISE", ["N/A"], ["Switch"], false, callback);
        },
        function (callback) {
            gameCreate("Monopoly", ["N/A"], ["PC", "iOS", "Andriod"], false, callback);
        },
        function (callback) {
            gameCreate("Mario Kart Deluxe", ["N/A"], ["Switch"], false, callback);
        },
        function (callback) {
            gameCreate("Overwatch", ["Asia", "US", "Europe", "China"], ["PC", "PS4", "Xbox", "Switch"], false, callback);
        },
        function (callback) {
            gameCreate("Overcooked 2", ["N/A"], ["PC", "PS4", "Xbox One", "Switch"], false, callback);
        },
        function (callback) {
            gameCreate("Portal 2", ["N/A"], ["PC"], false, callback);
        },
        function (callback) {
            gameCreate("PUBG", ["NA", "SA", "EU", "JP", "KR", "SEA"], ["PC", "PS4", "Xbox"], false, callback);
        },
        function (callback) {
            gameCreate("Rainbow Six", ["US", "Brazil", "EU", "Asia", "Australia", "Japan"], ["PC", "PS4", "Xbox"], false, callback);
        },
        function (callback) {
            gameCreate("Risk of Rain 2", ["N/A"], ["PC", "PS4", "Xbox", "Switch"], false, callback);
        },
        function (callback) {
            gameCreate("Stardew Valley", ["N/A"], ["PC", "PS4", "Switch"], false, callback);
        },
        function (callback) {
            gameCreate("Super Smash Bros", ["N/A"], ["Switch"], false, callback);
        },
        function (callback) {
            gameCreate("Splatoon 2", ["N/A"], ["Switch"], false, callback);
        },
        function (callback) {
            gameCreate("UNO", ["N/A"], ["iOS", "Android", "PC"], false, callback);
        },

    ], cb);
}

async.series([createGames,], function (err, res) {
    if(err) {
        console.log("ERR: "+err);
    }
    else {
        console.log("All games are generated.");
    }
});