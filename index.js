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
// chat server relevant start from here
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
    },
});

//{ (key: userID, value: session) }
const allUserSessionStore = new Map();
//{ (key: userID, value: array of messages) }
const allUserMessageStore = new Map();

io.use((socket, next) => {
    const userID = socket.handshake.auth.userID;
    const username = socket.handshake.auth.username;
    if (!username || !userID) {
        return next(new Error("invalid username and userID"));
    }
    socket.userID = userID;
    socket.username = username;

    const targetID = socket.handshake.auth.targetID;
    const targetName = socket.handshake.auth.targetName;
    if (targetID && targetName) {
        socket.targetID = targetID;
        socket.targetName = targetName;
    }

    // extract existing session.
    const session = allUserSessionStore.get(userID);
    if (session) {
        socket.chatList = session.chatList;
        return next();
    }

    // create new session
    socket.chatList = [];
    next();
});

io.on("connection", (socket) => {
    // persist session
    allUserSessionStore.set(socket.userID, {
        userID: socket.userID,
        username: socket.username,
        chatList: socket.chatList,
        connected: true,
    });

    // emit session details
    socket.emit("session", {
        userID: socket.userID,
    });

    // join the "userID" room
    socket.join(socket.userID);

    // add target to current chatList if not exist
    if (socket.targetID && socket.targetName) {
        const targetID = socket.targetID;
        const targetName = socket.targetName;

        // initialize the target's sessionStore if not exist
        if (!allUserSessionStore.has(targetID)) {
            allUserSessionStore.set(targetID, {
                userID: targetID,
                username: targetName,
                chatList: [],
                connected: false,
            });
        }

        // save each other to the chatList
        const myChatList = allUserSessionStore.get(socket.userID).chatList;
        if (!myChatList.includes(targetID)) {
            myChatList.push(targetID);
        }
        const targetChatList = allUserSessionStore.get(targetID).chatList;
        if (!targetChatList.includes(socket.userID)) {
            targetChatList.push(socket.userID);
        }
    }

    // fetch existing users
    const users = [];
    const messagesPerUser = new Map();
    // get my message store
    const myMessageStore = allUserMessageStore.get(socket.userID);
    if (myMessageStore) {
        myMessageStore.forEach((message) => {
            const {from, to} = message;
            const otherUser = socket.userID === from ? to : from;
            if (messagesPerUser.has(otherUser)) {
                messagesPerUser.get(otherUser).push(message);
            } else {
                messagesPerUser.set(otherUser, [message]);
            }
        });
    }
    const myChatList = allUserSessionStore.get(socket.userID).chatList;
    for (let value of allUserSessionStore.values()) {
        if (myChatList.includes(value.userID)) {
            users.push({
                userID: value.userID,
                username: value.username,
                connected: value.connected,
                messages: messagesPerUser.get(value.userID) || [],
            });
        }
    }
    socket.emit("users", users);

    // notify existing users
    for (let value of allUserSessionStore.values()) {
        if (value.chatList.includes(socket.userID)) {
            socket.to(value.userID).emit("user connected", {
                userID: socket.userID,
                username: socket.username,
                connected: true,
                messages: [],
            });
        }
    }

    // forward the private message to the right recipient (and to other tabs of the sender)
    socket.on("private message", ({ content, to }) => {
        const from = socket.userID;
        const message = {
            content,
            from: from,
            to,
        };
        socket.to(to).to(from).emit("private message", message);
        if (allUserMessageStore.has(from)) {
            allUserMessageStore.get(from).push(message);
        }
        else {
            allUserMessageStore.set(from, [message]);
        }
        if (allUserMessageStore.has(to)) {
            allUserMessageStore.get(to).push(message);
        }
        else {
            allUserMessageStore.set(to, [message]);
        }
    });

    socket.on("disconnect", async () => {
        const matchingSockets = await io.in(socket.userID).allSockets();
        const isDisconnected = matchingSockets.size === 0;
        if (isDisconnected) {
            // notify other users
            for (let value of allUserSessionStore.values()) {
                if (value.chatList.includes(socket.userID)) {
                    socket.to(value.userID).emit("user disconnected", socket.userID);
                }
            }
            // update the connection status of the session
            allUserSessionStore.set(socket.userID, {
                userID: socket.userID,
                username: socket.username,
                chatList: socket.chatList,
                connected: false,
            });
        }
    });
});

/*
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
    // we shouldn’t lose messages from other users upon disconnection
    const messagesPerUser = new Map();
    messageStore.findMessagesForUser(socket.userID).forEach((message) => {
        const { from, to } = message;
        const otherUser = socket.userID === from ? to : from;
        if (messagesPerUser.has(otherUser)) {
            messagesPerUser.get(otherUser).push(message);
        } else {
            messagesPerUser.set(otherUser, [message]);
        }
    });
    sessionStore.findAllSessions().forEach((session) => {
        users.push({
            userID: session.userID,
            username: session.username,
            connected: session.connected,
            messages: messagesPerUser.get(session.userID) || [],
        });
    });
    socket.emit("users", users);

    // notify existing users
    socket.broadcast.emit("user connected", {
        userID: socket.userID,
        username: socket.username,
        connected: true,
        messages: [],
    });

    // forward the private message to the right recipient (and to other tabs of the sender)
    socket.on("private message", ({ content, to }) => {
        const message = {
            content,
            from: socket.userID,
            to,
        };
        socket.to(to).to(socket.userID).emit("private message", message);
        messageStore.saveMessage(message);
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
 */

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
