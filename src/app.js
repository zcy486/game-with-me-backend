"use strict";

const express    = require('express');
const bodyParser = require('body-parser');
const helmet     = require('helmet');
const middlewares = require('./middlewares');

const userRouter = require('./routes/userRouter');
const order = require('./routes/order');
const post = require('./routes/post');
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
app.use('/user', userRouter);
app.use('/order', order);
app.use('/post', post);

module.exports = app;
