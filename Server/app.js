var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors')
var session = require('express-session')
var randomstring = require("randomstring")
var NewsData = require('./scripts/newsData')

var index = require('./routes/index');
var users = require('./routes/users');
var news = require('./routes/news');

var config = require('./scripts/config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(cors())
app.use(session({
    secret: randomstring.generate({
        length: 128,
        charset: 'alphabetic'
    }),
    cookie: {
        maxAge: 6000*1000
    },
    resave: true,
    saveUninitialized: true
}));

app.use(function (req, res, next) {
    res.locals.genre = null
    res.locals.user = req.session.user;
    if( !res.locals.user )
        res.locals.user = null;
    // console.log("user = " + res.locals.user)
    res.locals.genres = config["genres"];
    NewsData.getScrollList((err, result)=>{
        if( err ){
            console.log(err)
        }else{
            // console.log(result)
            res.locals.scrollNews = result
        }
        next()
    })
});

app.use('/', index);
app.use('/users', users);
app.use('/news', news);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  console.log(err)
  res.render('error', { status: err.status || 500 });
});

module.exports = app;
