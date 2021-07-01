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

//============CHAT===============
// chat server relevant from here
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
    },
});

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");
const { InMemorySessionStore } = require("./chatStuff/sessionStore");
const sessionStore = new InMemorySessionStore();

// chat middlewares
io.use((socket, next) => {
    // used on reconnection
    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID) {
        const session = sessionStore.findSession(sessionID);
        if (session) {
            socket.sessionID = sessionID;
            socket.userID = session.userID;
            socket.username = session.username;
            return next();
        }
    }
    // used on new connection
    const userID = socket.handshake.auth.userID;
    const username = socket.handshake.auth.username;
    if (!username || !userID) {
        return next(new Error("invalid username and userID"));
    }
    // create new session
    socket.sessionID = randomId();
    socket.userID = userID;
    socket.username = username;
    next();
});

io.on("connection", (socket) => {
    // persist session
    sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: true,
    });

    // emit session details
    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
    });

    // join the "userID" room
    socket.join(socket.userID);

    // fetch existing users
    const users = [];
    sessionStore.findAllSessions().forEach((session) => {
        users.push({
            userID: session.userID,
            username: session.username,
            connected: session.connected,
        });
    });
    socket.emit("users", users);

    // notify existing users
    socket.broadcast.emit("user connected", {
        userID: socket.userID,
        username: socket.username,
        connected: true,
    });

    // forward the private message to the right recipient (and to other tabs of the sender)
    socket.on("private message", ({ content, to }) => {
        socket.to(to).to(socket.userID).emit("private message", {
            content,
            from: socket.userID,
            to,
        });
    });

    // notify users upon disconnection
    socket.on("disconnect", async () => {
        const matchingSockets = await io.in(socket.userID).allSockets();
        const isDisconnected = matchingSockets.size === 0;
        if (isDisconnected) {
            // notify other users
            socket.broadcast.emit("user disconnected", socket.userID);
            // update the connection status of the session
            sessionStore.saveSession(socket.sessionID, {
                userID: socket.userID,
                username: socket.username,
                connected: false,
            });
        }
    });
});

//============CHAT===============

//TODO to be removed
//The following part generates test data on games, posts and users.
mongoose.Promise = global.Promise;

async function gameCreate(name, allServers, allPlatforms, isPopular, cb) {
    let exist = await Game.exists({name: name});
    if(!exist) {
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
}

function createGames(cb) {
    async.parallel([
        function (callback) {
            gameCreate("Apex Legends", ["Europe", "Korea", "Japan", "North America", "South America"], ["PC", "PS4", "Xbox"], false, callback);
        },
        function (callback) {
            gameCreate("Animal Crossing: New Horizons", ["N/A"], ["Switch"], false, callback);
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
            gameCreate("PUBG", ["NA", "SA", "EU", "JP", "KR", "SEA"], ["PC", "PS4", "Xbox"], true, callback);
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