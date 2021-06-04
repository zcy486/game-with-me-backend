"use strict";

const express    = require('express');
const bodyParser = require('body-parser');
const helmet     = require('helmet');
const middlewares = require('./middlewares');

const userAuthRouter = require('./routes/userAuth');

const app = express();

//Adding middlewares
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(middlewares.allowCrossDomain);

// Basic route
app.get('/', (req, res) => {
    res.json({
        name: 'GameWithMe Backend'
    });
});

//Adding routes
app.use('/auth', userAuthRouter);

module.exports = app;
