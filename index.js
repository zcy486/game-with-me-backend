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

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

const { InMemorySessionStore } = require("./chatStuff/sessionStore");
const sessionStore = new InMemorySessionStore();

const { InMemoryMessageStore } = require("./chatStuff/messageStore");
const messageStore = new InMemoryMessageStore();

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
