"use strict";

const express    = require('express');
const bodyParser = require('body-parser');
const helmet     = require('helmet');
const middlewares = require('./middlewares');
const cors = require("cors");
const path = require("path");
const userRouter = require('./routes/userRouter');
const orderRouter = require('./routes/orderRouter');
const postRouter = require('./routes/postRouter')
const gameRouter = require('./routes/gameRouter')
const searchRouter = require('./routes/searchRouter');
const reviewRouter = require('./routes/reviewRouter');
const paymentRouter = require('./routes/paymentRouter');


const app = express();

//Adding middlewares
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(middlewares.allowCrossDomain);
app.use(cors());



app.use("/uploadImages", express.static(path.join(process.cwd(), 'uploadImages')));

// Basic route
app.get('/', (req, res) => {
    res.json({
        name: 'GameWithMe Backend'
    });
});

//Adding routes
app.use('/user', userRouter);
app.use('/order', orderRouter);
app.use('/post', postRouter);
app.use('/game', gameRouter);
app.use('/search', searchRouter);
app.use('/review', reviewRouter);
app.use('/payment', paymentRouter);

module.exports = app;
