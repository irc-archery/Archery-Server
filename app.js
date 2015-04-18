var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var connectCouchDB = require('connect-couchdb')(session);

var app = express();

var store = new connectCouchDB({
	name: process.env.couchdb_name || 'db_name',
	username: process.env.couchdb_user || 'db_user',
	password: process.env.couchdb_pass || 'db_pass',
	host: process.env.couchdb_host || 'db_host'
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(session({
	name: "connect.sid",
	secret: process.env.session_sercret || 'secret',
  	saveUninitialized: true,
	cookie: {
		httpOnly: false
    		// bellow is a recommended option. however, it requires an https-enabled website...
    		// secure: true,
	},
	store: store
	})
);

var routes = require('./routes/index');
var app_routes = require('./routes/app_routes');
app.use('/', routes);
app.use('/app', app_routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//--- Error Handlers ---//

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//--- End Error Handlers ---//

module.exports = app;
