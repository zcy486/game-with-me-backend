"use strict";

const port = "4000";
const mongoURI = "mongodb://localhost:27017/gamewithme";
const JwtSecret = "very secret secret";

module.exports = {
    port,
    mongoURI,
    JwtSecret,
};
