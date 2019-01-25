const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const connectMongo = require('connect-mongo');

const admin = require('./routes/admin');
const accounts = require('./routes/accounts');
const auth = require('./routes/auth');
const home = require('./routes/home');
const chat = require('./routes/chat');

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
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
// app.use(session({
//     secret: 'fastcampus',
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         maxAge: 2000 * 60 * 60
//     }
// }));

const MongoStore = connectMongo(session);
const sessionMiddleware = session({
    secret: 'fastcampus',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 2000 * 60 * 60
    },
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 14 * 24 * 60 * 60
    })
});
app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    app.locals.isLogin = req.isAuthenticated();
    next();
});

// app.get('/', (req, res) => {
//     res.send('first page');
// });

app.use('/admin', admin);
app.use('/accounts', accounts);
app.use('/auth', auth);
app.use('/', home);
app.use('/chat', chat);

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const listen = require('socket.io');
const io = listen(server);
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
});
require('./libs/socketConnection')(io);