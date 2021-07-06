"use strict";

const http       = require('http');
const mongoose   = require('mongoose');

const app        = require('./src/app');
const config     = require('./src/config');

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
    const myChatList = allUserSessionStore.get(socket.userID).chatList;
    for (let value of allUserSessionStore.values()) {
        if (myChatList.includes(value.userID)) {
            users.push({
                userID: value.userID,
                username: value.username,
                connected: value.connected,
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
            });
        }
    }

    socket.on("load messages", ({ from, to }) => {
        const myStore = allUserMessageStore.get(from);
        if (myStore) {
            const messages = myStore.get(to);
            if (messages) {
                socket.emit("loaded messages", messages);
            }
        }
    });

    // forward the private message to the right recipient (and to other tabs of the sender)
    socket.on("private message", ({ content, to }) => {
        const from = socket.userID;
        const message = {
            content,
            from: from,
            to,
        };
        socket.to(to).to(from).emit("private message", message);
        const myMessageStore = allUserMessageStore.get(from);
        if (myMessageStore) {
            const otherUser = myMessageStore.get(to);
            if (otherUser) {
                otherUser.push(message);
            } else {
                myMessageStore.set(to, [message]);
            }
        } else {
            const newStore = new Map();
            newStore.set(to, [message]);
            allUserMessageStore.set(from, newStore);
        }
        const otherMessageStore = allUserMessageStore.get(to);
        if (otherMessageStore) {
            const messagesWithMe = otherMessageStore.get(from);
            if (messagesWithMe) {
                messagesWithMe.push(message);
            } else {
                otherMessageStore.set(from, [message]);
            }
        } else {
            const newStore = new Map();
            newStore.set(from, [message]);
            allUserMessageStore.set(to, newStore);
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

//============CHAT===============
