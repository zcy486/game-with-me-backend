const Chat = require("./models/chat");
const Message = require("./models/message");
const Session = require("./models/session");

exports = module.exports = function (io) {

    io.use(async (socket, next) => {
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
        const session = await Session.findOne({userID: userID});
        if (session) {
            socket.chatList = session.chatList;
            return next();
        }
        // create new session
        socket.chatList = [];
        next();
    });

    io.on("connection", async (socket) => {
        // persist session
        await Session.findOneAndUpdate({userID: socket.userID}, {
            userID: socket.userID,
            username: socket.username,
            chatList: socket.chatList,
            connected: true,
        }, {upsert: true});

        // emit session details
        socket.emit("session", {
            userID: socket.userID,
        });

        // join the "userID" room
        socket.join(socket.userID);

        // add target to the chatList if not exist
        if (socket.targetID && socket.targetName) {
            const targetID = socket.targetID;
            const targetName = socket.targetName;

            // save each other to the chatList
            const mySession = await Session.findOne({userID: socket.userID});
            if (!mySession.chatList.includes(targetID)) {
                mySession.chatList.push(targetID);
                await mySession.save();
            }
            // initialize the target's sessionStore if not exist
            const targetSession = await Session.findOne({userID: targetID});
            if (targetSession) {
                if (!targetSession.chatList.includes(socket.userID)) {
                    targetSession.chatList.push(socket.userID);
                    await targetSession.save();
                }
            } else {
                await Session.create({
                    userID: targetID,
                    username: targetName,
                    chatList: [socket.userID],
                    connected: false,
                });
            }
        }

        // fetch existing users and notify them
        const users = [];
        const mySession = await Session.findOne({userID: socket.userID});
        const myChatList = mySession.chatList;
        const friends = await Session.find({"userID": {"$in": myChatList}});
        friends.forEach((friend) => {
            users.push({
                userID: friend.userID,
                username: friend.username,
                connected: friend.connected,
            });
            // notify existing users
            socket.to(friend.userID).emit("user connected", {
                userID: socket.userID,
                username: socket.username,
                connected: true,
            });
        });
        socket.emit("users", users);

        // load messages between users from and to
        socket.on("load messages", async ({from, to}) => {
            const chat = await Chat.findOne({
                "$or":[
                    {"userA": from, "userB": to},
                    {"userA": to, "userB": from}
                ]
            }).populate("messages");
            if (chat) {
                socket.emit("loaded messages", chat.messages);
            }
        });

        // forward the private message to the right recipient (and to other tabs of the sender)
        socket.on("private message", async ({content, to}) => {
            const from = socket.userID;
            const message = {
                content,
                from: from,
                to,
            };
            socket.to(to).to(from).emit("private message", message);
            // save message in the db
            const dbMessage = await Message.create({
                from: from,
                to: to,
                content: content,
            });
            const chat = await Chat.findOne({
                "$or":[
                    {"userA": from, "userB": to},
                    {"userA": to, "userB": from}
                ]
            });
            if (chat) {
                chat.messages.push(dbMessage._id);
                await chat.save();
            } else {
                await Chat.create({
                    userA: from,
                    userB: to,
                    messages: [dbMessage._id],
                });
            }
        });

        socket.on("disconnect", async () => {
            const matchingSockets = await io.in(socket.userID).allSockets();
            const isDisconnected = matchingSockets.size === 0;
            if (isDisconnected) {
                // notify other users
                const friends = await Session.find({chatList: socket.userID});
                friends.forEach((friend) => {
                    socket.to(friend.userID).emit("user disconnected", socket.userID);
                });
                // update the connection status of the session
                await Session.findOneAndUpdate({userID: socket.userID}, {
                    connected: false,
                });
            }
        });
    });
}
