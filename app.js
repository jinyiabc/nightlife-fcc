var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var cors = require('cors')


var index = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');
// var yelp = require('./routes/yelp')
var routes = require('./routes/yelp');
var mongoose = require('mongoose');
var session = require('express-session');

require('dotenv').load();
var passport = require('./config/passport');

var app = express();
// connect to mongoDB
// mongoose.connect('mongodb://localhost/users');
mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/angular', express.static(process.cwd() + '/app/angular'));
app.use('/controllers', express.static(process.cwd() + '/app/controllers'));


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
// app.use(cors())   // Simple Usage (Enable All CORS Requests)
app.use(function(req,res,next){
  if(!req.session.location){
    req.session.location = '';
  }
  // console.log(req.session);
  // if(req.params.location){
  //   req.session.location = req.params.location;
  // }

  next();
})

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
//uses persistent login sessions,
app.use(passport.session());
var path = process.cwd();



// app.get('/', function(req, res, next) {
//   res.render('index');
// });
// app.get('/' ,function(req, res) {
//   res.sendFile(path + '/public/index.html');
// });
//
// app.use('/home', function(req,res,next){
//   res.render('home',{user: req.user})
// });
// app.use('/login',function(req,res,next){
//   res.render('login')
// });
// app.get('/profile',
//   require('connect-ensure-login').ensureLoggedIn(),
//   function(req, res){
//     res.render('profile', { user: req.user });
//   });

// app.use('/yelp',yelp);
routes(app,passport);


// app.route('/auth/github')
// 	.get(passport.authenticate('github'));
//
// app.route('/auth/github/callback')
// 	.get(passport.authenticate('github', {
// 		successRedirect: '/',
// 		failureRedirect: '/login'
// 	}));


//
// // initialize the routes
// app.use('/yelp',yelp);


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
  res.render('error');
});

module.exports = app;

function homeAuthenticate(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
