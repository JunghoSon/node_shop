const express = require('express');
const admin = require('./routes/admin');
const path = require('path');
const mongoose = require('mongoose');
const logger = require('morgan');
const bodyParser = require('body-parser');

const db = mongoose.connection;
mongoose.Promise = global.Promise;

db.on('error', console.error);
db.once('open', () => {
    console.log('mongodb is connected');
});

mongoose.connect('mongodb://127.0.0.1:27017/fastcampus', {useMongoClient: true});

const app = express();
const port = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
    res.send('first page');
});

app.use('/admin', admin);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});